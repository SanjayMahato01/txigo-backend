import Bank from "../models/bank.model.js";

// 1. Add or Create Bank Details
export const addBankDetails = async (req, res) => {
  try {
    const { vendorId, fullName, bankName, bankNumber, ifscCode, upiNumber, upiAddress } = req.body;

    // Check if already exists
    const existing = await Bank.findOne({ vendorId });
    if (existing) {
      return res.status(409).json({ success: false, message: "Bank details already exist" });
    }

    const bank = await Bank.create({ vendorId, fullName, bankName, bankNumber, ifscCode, upiNumber, upiAddress });

    res.status(201).json({ success: true, data: bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Bank Details by vendorId
export const getBankDetails = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const bank = await Bank.findOne({ vendorId });

    if (!bank) {
      return res.status(404).json({ success: false, message: "Bank details not found" });
    }

    res.json({ success: true, data: bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Bank Details by vendorId
export const updateBankDetails = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const updateData = req.body;

    const bank = await Bank.findOneAndUpdate({ vendorId }, updateData, { new: true });

    if (!bank) {
      return res.status(404).json({ success: false, message: "Bank details not found" });
    }

    res.json({ success: true, data: bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
