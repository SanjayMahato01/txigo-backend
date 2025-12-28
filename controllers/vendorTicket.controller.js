import Ticket from "../models/vendorTicket.model.js";

const generateTicketId = () => {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-char random
  return `#${randomPart}`;
};

export const createTicket = async (req, res) => {
  try {
    const { vendor, subject, description } = req.body;

    if (!vendor || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "vendor, subject, and description are required",
      });
    }

    const ticket = new Ticket({
      vendor,
      subject,
      description,
      ticketId: generateTicketId(), // Using your existing function
      messages: [] 
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });

  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 }) // latest first
      .populate("vendor", "name email"); // optional: populate vendor details

    res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};


export const getVendorTickets = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const tickets = await Ticket.find({ vendor: vendorId })
      .sort({ createdAt: -1 }) // latest first
      .populate("vendor", "name email");

    res.status(200).json({
      success: true,
      message: "Vendor tickets fetched successfully",
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching vendor tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor tickets",
      error: error.message,
    });
  }
};


export const addMessageToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { sender, message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Valid message content is required"
      });
    }

    if (!['vendor', 'admin'].includes(sender)) {
      return res.status(400).json({
        success: false,
        message: "Valid sender (vendor/admin) is required"
      });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          messages: {
            sender,
            message: message.trim()
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('vendor', 'email name'); // Include any vendor fields you need

    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Message added successfully",
      data: updatedTicket
    });

  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "Fixed" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Ticket resolved successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error resolving ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve ticket",
      error: error.message
    });
  }
};