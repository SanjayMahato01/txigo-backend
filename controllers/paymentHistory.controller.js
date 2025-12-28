import PaymentHistory from "../models/paymentHistory.model.js";

export const getPaymentHistoryByVendorAndType = async (req, res) => {
  try {
    const { vendorId, historyType } = req.params;

    if (!vendorId || !historyType) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID and history type are required in params",
      });
    }

    const history = await PaymentHistory.find({
      vendorId,
      historyType,
    }).populate("orderId"); // optionally populate related order

    return res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
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