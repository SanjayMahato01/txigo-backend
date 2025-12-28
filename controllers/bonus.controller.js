import Bonus from "../models/bonus.model.js";

export const createBonus = async (req, res) => {
  try {
    const { vendor, amount, reason } = req.body;
    
    if (!vendor || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields (vendor, amount, reason) are required"
      });
    }

    const newBonus = new Bonus({
      vendor,
      amount,        // amount as string
      reason
    });

    await newBonus.save();

    res.status(201).json({
      success: true,
      message: "Bonus created successfully",
      data: newBonus
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating Bonus",
      error: error.message
    });
  }
};


export const getAllBonus = async (req, res) => {
  try {
    const Bonuss = await Bonus.find().populate("vendor");

    res.status(200).json({
      success: true,
      data: Bonuss
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching Bonuss",
      error: error.message
    });
  }
};

export const getBounusByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const Bonuss = await Bonus.find({ vendor: vendorId })
      .populate("vendor")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      data: Bonuss
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching Bonuss for vendor",
      error: error.message
    });
  }
};
