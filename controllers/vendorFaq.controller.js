import VendorFaq from "../models/vendorFaq.model.js";

export const getAllFaq = async (req, res) => {
  try {
    const faqs = await VendorFaq.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({
      success: true,
      message: "FAQs fetched successfully",
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error.message,
    });
  }
};

// Add new FAQ
export const addFaq = async (req, res) => {
  try {
    const { subject, description } = req.body;

    const newFaq = new VendorFaq({ subject, description });
    await newFaq.save();

    res.status(201).json({ success: true, message: "FAQ created successfully", data: newFaq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create FAQ", error: error.message });
  }
};

// Update FAQ
export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedFaq = await VendorFaq.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedFaq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, message: "FAQ updated successfully", data: updatedFaq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update FAQ", error: error.message });
  }
};

// Delete FAQ
export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFaq = await VendorFaq.findByIdAndDelete(id);

    if (!deletedFaq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete FAQ", error: error.message });
  }
};
