import Vendor from '../models/vendor.model.js';
import Referral from '../models/referral.model.js';

export const createReferral = async (req, res) => {
  try {
    const { referralCode, newVendorId } = req.body;

    if (!referralCode || !newVendorId) {
      return res.status(400).json({ success: false, message: 'Referral code and new vendor ID are required' });
    }

    // Find the vendor who owns this referral code
    const referrer = await Vendor.findOne({ referalCode: referralCode });

    if (!referrer) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }

    // Prevent self-referral
    if (referrer._id.toString() === newVendorId) {
      return res.status(400).json({ success: false, message: 'You cannot refer yourself' });
    }

    // Optional: check if already referred
    const alreadyReferred = await Referral.findOne({ newVendor: newVendorId });
    if (alreadyReferred) {
      return res.status(400).json({ success: false, message: 'This vendor was already referred' });
    }

    // Create referral entry
    const newReferral = new Referral({
      vendor: referrer._id,
      newVendor: newVendorId
    });
    await newReferral.save();

    // Add 100 coins to referrer
    const existingCoins = parseInt(referrer.coins || '0');
    referrer.coins = (existingCoins + 100).toString();
    await referrer.save();

    res.status(201).json({
      success: true,
      message: 'Referral recorded and coins added',
      referral: newReferral
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find()
      .sort({ createdAt: -1 }) // latest first
      .populate('vendor', 'email fullName referalCode') // populate referrer info
      .populate('newVendor', 'email fullName'); // populate new vendor info (if ObjectId)

    res.status(200).json({
      success: true,
      message: 'All referrals fetched successfully',
      data: referrals
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};