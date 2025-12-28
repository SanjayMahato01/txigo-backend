import Penalties from "../models/penalties.model.js";
import TripReviews from "../models/tripReviews.model.js";

export const createPenalty = async (req, res) => {
  try {
    const { bookingId, amount, driver, vendor, description, reversed } = req.body;

    // 1️⃣ Create new penalty
    const newPenalty = new Penalties({
      bookingId,
      amount,
      driver,
      vendor,
      description,
      reversed: reversed || false
    });

    const savedPenalty = await newPenalty.save();

    // 2️⃣ Update TripReview penalty field
    await TripReviews.findOneAndUpdate(
      { bookingId: bookingId },
      { $set: { penalty: amount.toString() } },  // store as string
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Penalty created and TripReview updated successfully.",
      data: savedPenalty
    });
  } catch (error) {
    console.error("Error creating penalty:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create penalty.",
      error: error.message
    });
  }
};


export const getPenaltiesByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params; // get vendorId from params

    const penalties = await Penalties.find({ vendor: vendorId })
      .populate("driver")
      .populate("vendor")
      .sort({ createdAt: -1 });  // latest first

    res.status(200).json({
      success: true,
      message: "Penalties fetched successfully for this vendor.",
      data: penalties
    });
  } catch (error) {
    console.error("Error fetching penalties by vendorId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch penalties by vendorId.",
      error: error.message
    });
  }
};

export const getAllPenalties = async (req, res) => {
  try {
    const penalties = await Penalties.find()
      .populate("driver")
      .populate("vendor")
      .sort({ createdAt: -1 });  // latest first

    res.status(200).json({
      success: true,
      message: "All penalties fetched successfully.",
      data: penalties
    });
  } catch (error) {
    console.error("Error fetching all penalties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all penalties.",
      error: error.message
    });
  }
};



