import EarningHistory from "../models/earningHistory.modal.js";
import Vendor from "../models/vendor.model.js"

export const getEarningHistoryByVendorAndType = async (req, res) => {
  try {
    const { vendorId, historyType } = req.params;
  
    if (!vendorId || !historyType) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID and history type are required in params",
      });
    }

    const history = await EarningHistory.find({
      vendorId,
      historyType,
    }).populate("orderId"); // optionally populate related order

    return res.status(200).json({
      success: true,
      message: "Earning history fetched successfully",
      data: history,
    });

  } catch (error) {
    console.error("Error fetching payment history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createEarningHistory = async (req, res) => {
  try {
    const { vendorId, reason, amount, historyType, orderId } = req.body;

    // Validation
    if (!vendorId || !reason || !amount || !historyType || !orderId) {
      return res.status(400).json({
        success: false,
        message: "All fields (vendorId, reason, amount, historyType, orderId) are required",
      });
    }

    // Fetch vendor with plan populated
    const vendor = await Vendor.findById(vendorId).populate('plan.planId');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    let finalAmount = parseFloat(amount); // convert amount to number

    if (vendor.plan && vendor.plan.planId) {
      const planName = vendor.plan.planId.name;

      if (planName !== 'DIAMOND') {
        // Deduct 10% if not Diamond
        finalAmount = finalAmount - (finalAmount * 0.10);
      }

      // Optional: round to 2 decimal places
      finalAmount = parseFloat(finalAmount.toFixed(2));
    } else {
      // In case vendor has no plan assigned
      finalAmount = finalAmount - (finalAmount * 0.10);
      finalAmount = parseFloat(finalAmount.toFixed(2));
    }

    // Create history entry
    const newHistory = await EarningHistory.create({
      vendorId,
      reason,
      amount: finalAmount,
      historyType,
      orderId,
    });

    return res.status(201).json({
      success: true,
      message: "Earning history created successfully",
      data: newHistory,
    });
  } catch (error) {
    console.error("Error creating earning history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};