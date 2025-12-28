import Vendor from '../models/vendor.model.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { transporter } from '../utils/emailSender.js';
import FleetPlan from '../models/vendorPricingFleet.js';
import mongoose from 'mongoose';
import PaymentHistory from '../models/paymentHistory.model.js';

const JWT_SECRET = process.env.VENDOR_JWT_SECRET || 'dfdjfk33jkjdjdsfdsdfdf';
const SMS_API_USER = process.env.SMS_API_USER;
const SMS_API_PASSWORD = process.env.SMS_API_PASSWORD;
const SMS_API_SENDER_ID = process.env.SMS_API_SENDER_ID;
const SMS_API_TEMPLATE_ID = process.env.SMS_API_TEMPLATE_ID;
const SMS_API_BASE_URL = process.env.SMS_API_BASE_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;
const isProduction = process.env.NODE_ENV

export const loginVendor = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const vendor = await Vendor.findOne({ username: username });

    if (!vendor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Plain text password check
    if (vendor.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: vendor._id,
      role: 'vendor',
      name: vendor.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    // Save token cookie as 'vendor'
    res.cookie('vendor', token, {
      domain: isProduction ? ".txigo.com" : "localhost",
      httpOnly: true,
      secure: true, // set false for local dev if needed
      sameSite: 'none', // change to 'lax' or 'strict' depending on frontend/backend domains
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });


    return res.json({
      message: 'Logged in successfully', data: {
        isVerified: vendor.isVerified,
        id: vendor._id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const logoutVendor = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("vendor", {
      domain: isProduction ? ".txigo.com" : "localhost",
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/", // ensure the path matches where it was originally set
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error during logout" });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 }); // latest first


    res.status(200).json({
      success: true,
      message: 'Vendors fetched successfully',
      data: vendors
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
};

const otpStorage = {};


export const sendVendorOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Valid mobile number is required' });
    }

    const vendor = await Vendor.findOne({ phone });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration
    otpStorage[phone] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    // Construct SMS message
    const message = `${otp} is the OTP to validate your phone number with the BroomBoom Cabs App. Please do not share the OTP with anyone. BroomBoom Cabs Thanks.`;

    // Construct URL with query params (like your working code)
    const smsUrl = `${SMS_API_BASE_URL}?user=${SMS_API_USER}&password=${SMS_API_PASSWORD}&senderid=${SMS_API_SENDER_ID}&mobiles=+91${phone}&tempid=${SMS_API_TEMPLATE_ID}&sms=${encodeURIComponent(message)}`;

    // Send request with axios.get
    const smsResponse = await axios.get(smsUrl);


    if (smsResponse.status === 200) {
      return res.json({
        success: true,
        message: 'OTP sent successfully',
      });
    } else {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const verifyVendorOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!otpStorage[phone]) {
      return res.status(400).json({ message: 'OTP expired or not generated' });
    }

    const { otp: storedOtp, expiresAt } = otpStorage[phone];

    if (Date.now() > expiresAt) {
      delete otpStorage[phone];
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid
    delete otpStorage[phone];

    // ✅ Find the vendor
    const vendor = await Vendor.findOne({ phone });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // ✅ Create JWT payload
    const payload = {
      id: vendor._id,
      role: 'vendor',
      name: vendor.name,
    };

    // ✅ Generate token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    // ✅ Set token in cookie
    res.cookie('vendor', token, {
      domain: isProduction ? ".txigo.com" : "localhost",
      httpOnly: true,
      secure: true, // set false for local dev if needed
      sameSite: 'none', // change to 'lax' or 'strict' depending on frontend/backend domains
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // ✅ Send response
    return res.status(200).json({
      success: true,
      message: 'OTP verified and vendor logged in successfully',
      data: {
        isVerified: vendor.isVerified,
        id: vendor._id
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Vendor.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '15m',
    });

    const resetLink = `${FRONTEND_URL}/vendor/reset-password?token=${token}`;


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h3>Hello ${user.name || 'User'},</h3>
        <p>You requested to reset your password.</p>
        <p><a href="${resetLink}">Click here to reset</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.json({ success: true, message: 'Reset link sent to your email' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const vendor = await Vendor.findById(decoded.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    // Store raw password (NOT recommended)
    vendor.password = password;
    await vendor.save();

    return res.json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error while resetting password.' });
  }
};

export const updateVendorDetails = async (req, res) => {

  try {
    const { id } = req.params;

    const {
      fullName,
      businessName,
      address,
      city,
      state,
      pincode,
      tradeLicense,
      gstNumber,
      panNumber,
      aadharNumber,
      isVerified,
      vendorCod
    } = req.body;

    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      {
        fullName,
        BusinessName: businessName,
        BusinessAddress: address,
        city,
        state,
        pinCode: pincode,
        tradeLicense,
        gstNumber,
        PanNumber: panNumber,
        AadharNumber: aadharNumber,
        isVerified: isVerified,
        vendorCod
      },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor details updated successfully',
      vendor: updatedVendor
    });

  } catch (error) {
    console.error('Error updating vendor:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const assignPlan = async (req, res) => {
  const { vendorId } = req.params;
  const { planId } = req.body;

  try {
    // Find the FleetPlan by planId
    const fleetPlan = await FleetPlan.findById(planId);
    if (!fleetPlan) return res.status(404).json({ error: "FleetPlan not found" });

    // Calculate expiresAt based on fleetPlan.validity (e.g., "6 months")
    const validityMonths = parseInt(fleetPlan.validity.split(' ')[0]);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + validityMonths);

    // Determine fleetAllowed and driverAllowed (custom logic)
    let fleetAllowed = "2";
    let driverAllowed = "2";

    if (fleetPlan.fleets.includes("10")) {
      fleetAllowed = "10";
      driverAllowed = "10";
    } else if (fleetPlan.fleets.includes("25")) {
      fleetAllowed = "25";
      driverAllowed = "25";
    } else if (fleetPlan.fleets.includes("5")) {
      fleetAllowed = "5";
      driverAllowed = "5";
    }

    // Update vendor with plan, expiration, and allowances
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        $set: {
          plan: {
            planId,
            purchasedAt: new Date(),
            expiresAt,
          },
          fleetAllowed,
          driverAllowed,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      plan: vendor.plan,
      fleetAllowed: vendor.fleetAllowed,
      driverAllowed: vendor.driverAllowed,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getVendorPlan = async (req, res) => {
  const { vendorId } = req.params;


  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    res.json({ plan: vendor.plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getOneVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id)
      .populate({
        path: 'plan.planId',
        model: 'FleetPlan'
      })
      .lean();

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID format'
      });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


export const updateVendorPlan = async (req, res) => {
  const { vendorId, newPlanId } = req.body;

  try {
    const selectedPlan = await FleetPlan.findById(newPlanId);
    if (!selectedPlan) {
      return res.status(404).json({
        success: false,
        message: 'Selected plan not found'
      });
    }

    // Parse validity string like "6 months" or "9 months"
    const months = parseInt(selectedPlan.validity); // Assumes format like "6 months"

    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt);
    expiresAt.setMonth(purchasedAt.getMonth() + months); // Adds validity months

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        plan: {
          planId: newPlanId,
          purchasedAt,
          expiresAt,
          isActive: true
        }
      },
      { new: true }
    ).populate('plan.planId');

    res.status(200).json({
      success: true,
      message: 'Vendor plan updated successfully',
      data: {
        ...updatedVendor.toObject(),
        expiresAt: expiresAt
      }
    });

  } catch (error) {
    console.error('Error updating vendor plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor plan',
      error: error.message
    });
  }
};


export const updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, reason } = req.body;

    // Validate input
    if (!["pending", "blocked", "active"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending', 'blocked', or 'active'"
      });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        $set: {
          "status.current": status,
          "status.reason": reason || "" // Set empty string if no reason provided
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor status updated successfully",
      vendor: {
        id: updatedVendor._id,
        status: updatedVendor.status
      }
    });

  } catch (error) {
    console.error("Error updating vendor status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getLoggedInVendor = async (req, res) => {
  try {
    const token = req.cookies.vendor;
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const vendorId = decoded.id;

    // Find vendor by ID and exclude password from the returned data
    const vendor = await Vendor.findById(vendorId).populate("plan.planId").select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Return full vendor details (without password)
    return res.json({
      message: 'Vendor authenticated',
      vendor,
    });
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const getWalletBalance = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).select('walletBalance');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({ walletBalance: vendor.walletBalance });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateWalletBalance = async (req, res) => {
  try {
    const { vendorId, amount, reason, orderId, historyType } = req.body;

    // Validate input
    if (!vendorId || amount === undefined || !reason || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, amount, reason, and order ID are required',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid number',
      });
    }

    // Find vendor and populate plan details
    const vendor = await Vendor.findById(vendorId).populate('plan.planId');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    // Block diamond plan vendors
    if (vendor.plan?.planId?.name?.toLowerCase() === 'diamond') {
      return res.status(400).json({
        success: false,
        message: 'Diamond plan users cannot update wallet balance',
      });
    }

    // Update wallet balance (deducting amount)
    const currentBalance = parseFloat(vendor.walletBalance) || 0;
    const newBalance = currentBalance - numericAmount;

    // Update wallet balance in Vendor
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { walletBalance: newBalance.toString() },
      { new: true }
    );
    const isDiamondPlan = vendor.plan.planId?.name === 'DIAMOND';

    // Save payment history log
    await PaymentHistory.create({
      vendorId,
      reason,
      amount: `-${numericAmount}`, // ensure it's stored as negative
      historyType: historyType,
      orderId
    });

    return res.status(200).json({
      success: true,
      message: 'Wallet balance updated and payment history recorded',
      data: {
        newBalance: updatedVendor.walletBalance
      }
    });

  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};