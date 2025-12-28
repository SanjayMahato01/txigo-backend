import Incentive from "../models/incentive.model.js";

export const createIncentive = async (req, res) => {
  try {
    const { vendor, amount, description } = req.body;

    if (!vendor || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields (vendor, amount, description) are required"
      });
    }

    const newIncentive = new Incentive({
      vendor,
      amount,        // amount as string
      description
    });

    await newIncentive.save();

    res.status(201).json({
      success: true,
      message: "Incentive created successfully",
      data: newIncentive
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating incentive",
      error: error.message
    });
  }
};


export const getAllIncentives = async (req, res) => {
  try {
    const incentives = await Incentive.find().populate("vendor");

    res.status(200).json({
      success: true,
      data: incentives
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching incentives",
      error: error.message
    });
  }
};

export const getIncentivesByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const incentives = await Incentive.find({ vendor: vendorId })
      .populate("vendor")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      data: incentives
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching incentives for vendor",
      error: error.message
    });
  }
};
