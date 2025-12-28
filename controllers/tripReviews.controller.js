import Order from "../models/orders.model.js";
import Vendor from "../models/vendor.model.js";
import Penalties from "../models/penalties.model.js";
import TripReviews from "../models/tripReviews.model.js";

export const submitCustomerReview = async (req, res) => {
  try {
    const {
      bookingId,
      feedbackDate,
      driver,
      rating,
      customerComment,
      order,
      vendor
    } = req.body;

    // Validation (basic)
    if (!bookingId || !feedbackDate || !rating || !order || !vendor) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, Feedback Date, and Rating are required."
      });
    }

    // Create new Trip Review
    const newReview = new TripReviews({
      bookingId,
      feedbackDate,
      driver,
      rating,
      customerComment,
      order,
      vendor
    });

    await newReview.save();

    // After saving review, update customerReviewd in Order
    const updatedOrder = await Order.findOneAndUpdate(
      { bookingId: bookingId },
      { $set: { customerReviewd: true } },
      { new: true }
    ).populate('vendor');

    // Initialize penaltyAmount in outer scope
    let penaltyAmount = null;

    // Check if rating is poor or horrible
    if (['horrible', 'poor'].includes(rating)) {
      // Get the order details to access ride fare
      const orderDetails = await Order.findById(order).select('ridefare');
      const rideFare = parseFloat(orderDetails.ridefare || "0");
      
      // Calculate penalty amount (10% of ride fare)
      penaltyAmount = parseFloat((rideFare * 0.1).toFixed(2));
      
      // Create new penalty
      const newPenalty = new Penalties({
        bookingId,
        amount: penaltyAmount,
        driver,
        vendor,
        description: `Automatic penalty for ${rating} rating`
      });

      await newPenalty.save();

      // Deduct from vendor's wallet (safe string calculation)
      const vendorDoc = await Vendor.findById(vendor);
      const currentBalance = parseFloat(vendorDoc?.walletBalance || "0");
      const updatedBalance = (currentBalance - penaltyAmount).toFixed(2);

      await Vendor.findByIdAndUpdate(
        vendor,
        { walletBalance: updatedBalance.toString() }
      );
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review: newReview,
      order: updatedOrder,
      penaltyApplied: penaltyAmount !== null,
      penaltyAmount: penaltyAmount
    });

  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit review.",
      error: error.message
    });
  }
};


export const getAllTripReviews = async (req, res) => {
  try {
    const reviews = await TripReviews.find()
      .populate("driver")
      .populate("order")
      .sort({ createdAt: -1 });  // latest first

    res.status(200).json({
      success: true,
      message: "All trip reviews fetched successfully.",
      data: reviews
    });

  } catch (error) {
    console.error("Error fetching trip reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trip reviews.",
      error: error.message
    });
  }
};

export const updateTripReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { checked, vendorComment } = req.body;
    const updateData = {};
    
    if (typeof checked !== 'undefined') {
      updateData.checked = checked;
    }
    if (vendorComment !== undefined) {
      updateData.vendorComment = vendorComment;
    }

    const updatedReview = await TripReviews.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message
    });
  }
};

export const getTripReviewsByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params; // get orderId from URL params

    const reviews = await TripReviews.find({ vendor: vendorId })
      .populate("driver")
      .populate("order")
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      message: "Trip reviews fetched successfully for this order.",
      data: reviews
    });

  } catch (error) {
    console.error("Error fetching trip reviews by orderId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trip reviews by orderId.",
      error: error.message
    });
  }
};
