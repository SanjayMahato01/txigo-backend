
import Driver from "../models/driver.model.js"
import Vendor from '../models/vendor.model.js';
import { transporter } from '../utils/mailer.js';
import { processFiles, cleanFilesOnError } from "../middleware/uploadMiddleware.js";
import axios from 'axios';
import jwt from 'jsonwebtoken';

const {
  SMS_API_USER,
  SMS_API_PASSWORD,
  SMS_API_SENDER_ID,
  SMS_API_TEMPLATE_ID,
  SMS_API_BASE_URL
} = process.env;

export const createDriver = async (req, res) => {
  try {
    const { name, phone, city, carType, email } = req.body;

    if (!name || !phone || !city || !carType) {
      return res.status(400).json({
        error: 'All fields are required, including email.',
      });
    }

    const existingVendor = await Vendor.findOne({ $or: [{ email }, { phone }] });
    if (existingVendor) {
      return res.status(200).json({
        success: true,
        message: 'Vendor already exists',
        existingVendor: true,
        vendorId: existingVendor._id,
      });
    }

    // Generate password & username
    const password = Math.floor(100000 + Math.random() * 900000).toString();
    const username = name;

    // Save vendor
    const newVendor = new Vendor({
      username,
      password,
      email,
      phone,
      role: 'driver',
    });
    await newVendor.save();

    // Construct SMS message in the OTP format
    const creds = `${username}/${password}`;
    const message = `${creds} is the OTP to validate your phone number with the BroomBoom Cabs App. Please do not share the OTP with anyone. BroomBoom Cabs Thanks.`;

    // Build SMS API URL
    const smsUrl = `${process.env.SMS_API_BASE_URL}?user=${process.env.SMS_API_USER}&password=${process.env.SMS_API_PASSWORD}&senderid=${process.env.SMS_API_SENDER_ID}&mobiles=+91${phone}&tempid=${process.env.SMS_API_TEMPLATE_ID}&sms=${encodeURIComponent(message)}`;

    // Send SMS
    const smsResponse = await axios.get(smsUrl);

    if (smsResponse.status === 200) {
      return res.status(201).json({
        success: true,
        message: 'Driver and vendor created successfully. SMS sent.',
        vendor: newVendor,
        vendorId: newVendor._id,
      });
    } else {
      return res.status(500).json({
        message: 'Vendor created but failed to send SMS',
      });
    }

  } catch (error) {
    console.error('Error creating driver and vendor:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Server error while creating driver and vendor.',
    });
  }
};


export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find(); // Fetch all drivers
    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Server error while fetching drivers.' });
  }
};


const otpStorage = {};

// ✅ SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone || !/^[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Valid mobile number is required' });
    }

    // Optional: Check if vendor exists (remove if not needed)
    const vendor = await Vendor.findOne({ phone });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10-minute expiry
    otpStorage[phone] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    // Compose SMS message
    const message = `${otp} is the OTP to validate your phone number with the BroomBoom Cabs App. Please do not share the OTP with anyone. BroomBoom Cabs Thanks.`;

    // Build SMS API URL
    const smsUrl = `${process.env.SMS_API_BASE_URL}?user=${process.env.SMS_API_USER}&password=${process.env.SMS_API_PASSWORD}&senderid=${process.env.SMS_API_SENDER_ID}&mobiles=+91${phone}&tempid=${process.env.SMS_API_TEMPLATE_ID}&sms=${encodeURIComponent(message)}`;

    // Send OTP via SMS API
    const smsResponse = await axios.get(smsUrl);

    if (smsResponse.status === 200) {
      return res.json({ success: true, message: 'OTP sent successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ✅ VERIFY OTP & SAVE DRIVER
export const verifyOtp = async (req, res) => {
  const { phone, otp, city, name, email, verified } = req.body;

  if (!phone || !otp || !city || !name) {
    return res.status(400).json({
      success: false,
      message: 'Phone, OTP, city, and name are required',
    });
  }

  const record = otpStorage[phone];
  if (!record) {
    return res.status(400).json({ success: false, message: 'No OTP sent to this number' });
  }

  const isExpired = Date.now() > record.expiresAt;
  if (isExpired) {
    delete otpStorage[phone];
    return res.status(400).json({ success: false, message: 'OTP has expired' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  try {
    const existingDriver = await Driver.findOne({ phone });
    const isProduction = process.env.NODE_ENV

    const cookieOptions = {
      domain: isProduction ? ".txigo.com" : "localhost",
      httpOnly: true,
      secure: true,
      maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES || '604800000'),
      sameSite: 'none'
    };

    if (existingDriver) {
      const token = jwt.sign(
        { id: existingDriver._id },
        process.env.DRIVER_JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.cookie('driverToken', token, cookieOptions);

      return res.status(200).json({
        success: true,
        message: 'Driver already exists',
        driver: existingDriver,
        alreadyRegistered: true,
      });
    }

    // Save new driver
    const newDriver = new Driver({ name, phone, city, email, verified });
    await newDriver.save();

    const newToken = jwt.sign(
      { id: newDriver._id },
      process.env.DRIVER_JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('driverToken', newToken, cookieOptions);
    delete otpStorage[phone];

    return res.status(200).json({
      success: true,
      message: 'OTP verified and driver registered successfully',
      driver: newDriver,
      alreadyRegistered: false,
    });
  } catch (err) {
    console.error("Error saving driver:", err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save driver',
      error: err.message,
    });
  }
};

export const saveReferralCode = async (req, res) => {
  try {
    const { phone, referCode } = req.body;

    if (!phone || !referCode) {
      return res.status(400).json({ message: "Phone and referral code are required" });
    }

    const driver = await Driver.findOne({ phone });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.referCode = referCode;
    await driver.save();

    return res.status(200).json({ success: true, message: "Referral code saved successfully", driver });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateDriverProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      dateOfBirth,
      address,
      pinCode,
      state,
      city,
      gender,
      age
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !dateOfBirth || !address || !pinCode || !state || !gender || !age) {
      return res.status(400).json({ error: 'All profile fields including gender are required' });
    }

    // Find existing driver by phone or email
    const existingDriver = await Driver.findOne({
      $or: [{ phone }, { email }]
    });

    if (!existingDriver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Update profile fields
    existingDriver.name = name;
    existingDriver.email = email;
    existingDriver.dateOfBirth = dateOfBirth;
    existingDriver.address = address;
    existingDriver.pinCode = pinCode;
    existingDriver.state = state;
    existingDriver.city = city || existingDriver.city;
    existingDriver.gender = gender;
    existingDriver.age = age;

    // Save updated driver
    const updatedDriver = await existingDriver.save();

    // Update corresponding vendor email if changed
    if (email !== existingDriver.email) {
      await Vendor.findByIdAndUpdate(
        existingDriver.vendorId,
        { email },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      driver: {
        _id: updatedDriver._id,
        name: updatedDriver.name,
        phone: updatedDriver.phone,
        email: updatedDriver.email,
        city: updatedDriver.city,
        state: updatedDriver.state,
        gender: updatedDriver.gender
      }
    });

  } catch (error) {
    console.error('Error updating driver profile:', error);
    return res.status(500).json({
      error: 'Server error while updating profile',
      details: error.message
    });
  }
};


export const updateVehicleInfo = async (req, res) => {
  try {
    const {
      phone,
      rcNo,
      registeredDate,
      category,
      carType,
      city,
      seat
    } = req.body;

    // Validate required fields
    if (!phone || !rcNo || !registeredDate || !category || !carType || !city || !seat) {
      return res.status(400).json({
        success: false,
        error: "All vehicle fields are required: phone, rcNo, registeredDate, category, carType, city, and seat"
      });
    }

    // Validate category enum
    const validCategories = ["petrol", "diesel", "cng", "ev"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Invalid vehicle category. Must be one of: petrol, diesel, cng, ev"
      });
    }

    // Process uploaded files
    const uploadedFiles = processFiles(req, "drivers");
    if (uploadedFiles.length !== 4) {
      return res.status(400).json({
        success: false,
        error: "Please upload all 4 required images (RC front/back, Car front/back)"
      });
    }

    // Extract files in order: rcFront, rcBack, carFront, carBack
    const [rcFront, rcBack, carFront, carBack] = uploadedFiles;

    // Update driver's vehicle information
    const updatedDriver = await Driver.findOneAndUpdate(
      { phone },
      {
        $set: {
          "vehicle.rcNo": rcNo,
          "vehicle.registeredDate": registeredDate,
          "vehicle.category": category,
          "vehicle.carType": carType,
          "vehicle.city": city,
          "vehicle.seat": seat,
          "vehicle.rcImage.front": rcFront.url,
          "vehicle.rcImage.back": rcBack.url,
          "vehicle.carImage.front": carFront.url,
          "vehicle.carImage.back": carBack.url,
          "verificationStage": "pending" // Reset verification if updating
        }
      },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle information updated successfully",
      driver: {
        _id: updatedDriver._id,
        phone: updatedDriver.phone,
        vehicle: updatedDriver.vehicle
      }
    });

  } catch (error) {
    console.error("Error updating vehicle info:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating vehicle information"
    });
  }
};

// Add cleanup middleware
export const updateVehicleInfoWithCleanup = [
  updateVehicleInfo,
  cleanFilesOnError
];


export const updateDriverDocuments = async (req, res) => {
  try {
    // First process files
    const uploadedFiles = processFiles(req, "drivers");

    // Then get other fields from body
    const { phone, dlNo, aadharNo, panNo } = req.body;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required"
      });
    }

    // Validate document numbers
    if (!dlNo || !aadharNo || !panNo) {
      return res.status(400).json({
        success: false,
        error: "All document numbers (DL, Aadhar, PAN) are required"
      });
    }

    // Validate we have exactly 6 images
    if (uploadedFiles.length !== 6) {
      return res.status(400).json({
        success: false,
        error: "Please upload all 6 required images (front and back for DL, Aadhar, and PAN)"
      });
    }

    // Additional validation for image files
    const invalidFiles = uploadedFiles.filter(file =>
      !file.mimetype.startsWith('image/')
    );

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Only image files (JPG/PNG) are allowed"
      });
    }

    // Extract files in specific order: dlFront, dlBack, aadharFront, aadharBack, panFront, panBack
    const [dlFront, dlBack, aadharFront, aadharBack, panFront, panBack] = uploadedFiles;

    // Update driver's documents
    const updatedDriver = await Driver.findOneAndUpdate(
      { phone },
      {
        $set: {
          "documents.dlNo": dlNo,
          "documents.dlImage.front": dlFront.url,
          "documents.dlImage.back": dlBack.url,
          "documents.aadharNo": aadharNo,
          "documents.aadharImage.front": aadharFront.url,
          "documents.aadharImage.back": aadharBack.url,
          "documents.panNo": panNo,
          "documents.panImage.front": panFront.url,
          "documents.panImage.back": panBack.url,
          "verificationStage": "pending" // Reset verification if updating
        }
      },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Documents updated successfully",
      driver: {
        _id: updatedDriver._id,
        phone: updatedDriver.phone,
        documents: updatedDriver.documents
      }
    });

  } catch (error) {
    console.error("Error updating documents:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating documents"
    });
  }
};

// Add cleanup middleware
export const updateDriverDocumentsWithCleanup = [
  updateDriverDocuments,
  cleanFilesOnError
];

export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id); // Find driver by ID

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    res.status(200).json({ driver });
  } catch (error) {
    console.error('Error fetching driver by ID:', error);
    res.status(500).json({ error: 'Server error while fetching driver by ID.' });
  }
};

export const updateDriverProfileById = async (req, res) => {
  try {
    const { id } = req.params; // Get driver ID from URL parameters
    const {
      name,
      phone,
      email,
      dateOfBirth,
      address,
      pinCode,
      state,
      city,
      gender,
      age
    } = req.body;

    // Validate required fields


    // Find existing driver by ID
    const existingDriver = await Driver.findById(id);

    if (!existingDriver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check if phone or email is being changed to a value that already exists
    if (phone !== existingDriver.phone || email !== existingDriver.email) {
      const driverWithSamePhoneOrEmail = await Driver.findOne({
        $and: [
          { _id: { $ne: id } }, // Exclude current driver
          { $or: [{ phone }, { email }] }
        ]
      });

      if (driverWithSamePhoneOrEmail) {
        return res.status(400).json({
          error: 'Phone or email already exists for another driver'
        });
      }
    }

    // Update profile fields
    existingDriver.name = name;
    existingDriver.phone = phone;
    existingDriver.email = email;
    existingDriver.dateOfBirth = dateOfBirth;
    existingDriver.address = address;
    existingDriver.pinCode = pinCode;
    existingDriver.state = state;
    existingDriver.city = city || existingDriver.city;
    existingDriver.gender = gender;
    existingDriver.age = age;

    // Save updated driver
    const updatedDriver = await existingDriver.save();

    // Update corresponding vendor email if changed
    if (email !== existingDriver.email && existingDriver.vendorId) {
      await Vendor.findByIdAndUpdate(
        existingDriver.vendorId,
        { email },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      driver: {
        _id: updatedDriver._id,
        name: updatedDriver.name,
        phone: updatedDriver.phone,
        email: updatedDriver.email,
        city: updatedDriver.city,
        state: updatedDriver.state,
        gender: updatedDriver.gender
      }
    });

  } catch (error) {
    console.error('Error updating driver profile:', error);
    return res.status(500).json({
      error: 'Server error while updating profile',
      details: error.message
    });
  }
};


export const updateDriverDocumentsById = async (req, res) => {
  try {
    const { id } = req.params;
    const { documents, verified } = req.body;

    if (!documents) {
      return res.status(400).json({
        success: false,
        error: "Documents data is required"
      });
    }

    const {
      dlNo,
      dlImage,
      aadharNo,
      aadharImage,
      panNo,
      panImage
    } = documents;

    // Validate fields
    const missingFields = [
      !dlNo && "DL Number",
      !dlImage?.front && "DL Front Image",
      !dlImage?.back && "DL Back Image",
      !aadharNo && "Aadhar Number",
      !aadharImage?.front && "Aadhar Front Image",
      !aadharImage?.back && "Aadhar Back Image",
      !panNo && "PAN Number",
      !panImage?.front && "PAN Front Image",
      !panImage?.back && "PAN Back Image"
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing fields: ${missingFields.join(", ")}`
      });
    }

    // Perform update
    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      {
        $set: {
          "documents.dlNo": dlNo,
          "documents.dlImage.front": dlImage.front,
          "documents.dlImage.back": dlImage.back,
          "documents.aadharNo": aadharNo,
          "documents.aadharImage.front": aadharImage.front,
          "documents.aadharImage.back": aadharImage.back,
          "documents.panNo": panNo,
          "documents.panImage.front": panImage.front,
          "documents.panImage.back": panImage.back,
          verified: verified ?? false, // Optional verified flag
          verificationStage: "pending"
        }
      },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Documents updated successfully",
      driver: {
        _id: updatedDriver._id,
        verified: updatedDriver.verified,
        documents: updatedDriver.documents
      }
    });

  } catch (error) {
    console.error("Error updating documents by ID:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating documents"
    });
  }
};

export const getDriverByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required"
      });
    }

    // Find driver by phone number
    const driver = await Driver.findOne({ phone });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Return only necessary fields (avoid sending sensitive data)
    const responseData = {
      _id: driver._id,
      name: driver.name,
      phone: driver.phone,
      city: driver.city,
      status: driver.status,
      verified: driver.verified,
      verificationStage: driver.verificationStage,
      failerMessage: driver.failerMessage,
      failerSection: driver.failerSection,
      documents: {
        // Only include document verification status, not actual document numbers/images
        dlVerified: !!driver.documents?.dlNo,
        aadharVerified: !!driver.documents?.aadharNo,
        panVerified: !!driver.documents?.panNo
      },
      vehicle: {
        rcVerified: !!driver.vehicle?.rcNo,
        carImagesVerified: !!driver.vehicle?.carImage?.front
      }
    };

    res.status(200).json({
      success: true,
      driver: responseData
    });

  } catch (error) {
    console.error('Error fetching driver by phone:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching driver by phone'
    });
  }
};

// Attach cleanup middleware
export const updateDriverDocumentsByIdWithCleanup = [
  updateDriverDocumentsById,
  cleanFilesOnError
];


export const updateVehicleInfoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract both vehicle info and verification status
    const {
      vehicle,
      verified
    } = req.body;

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        error: "Vehicle data is required"
      });
    }

    const {
      rcNo,
      registeredDate,
      category,
      carType,
      city,
      seat,
      rcImage,
      carImage
    } = vehicle;


    // Validate required fields
    if (!rcNo || !registeredDate || !category || !carType || !city || !seat ||
      !rcImage?.front || !rcImage?.back || !carImage?.front || !carImage?.back) {
      return res.status(400).json({
        success: false,
        error: "All vehicle fields and images are required"
      });
    }

    // Validate category enum
    const validCategories = ["petrol", "diesel", "cng", "ev"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Invalid vehicle category. Must be one of: petrol, diesel, cng, ev"
      });
    }

    // Update driver record
    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      {
        $set: {
          "vehicle.rcNo": rcNo,
          "vehicle.registeredDate": registeredDate,
          "vehicle.category": category,
          "vehicle.carType": carType,
          "vehicle.city": city,
          "vehicle.seat": seat,
          "vehicle.rcImage.front": rcImage.front,
          "vehicle.rcImage.back": rcImage.back,
          "vehicle.carImage.front": carImage.front,
          "vehicle.carImage.back": carImage.back,
          verified: verified ?? false,  // Update verified flag if present
          verificationStage: "pending"  // Optional: Reset stage if needed
        }
      },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle information updated successfully",
      driver: {
        _id: updatedDriver._id,
        verified: updatedDriver.verified,
        vehicle: updatedDriver.vehicle
      }
    });

  } catch (error) {
    console.error("Error updating vehicle info by ID:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating vehicle information"
    });
  }
};

// Cleanup middleware export
export const updateVehicleInfoByIdWithCleanup = [
  updateVehicleInfoById,
  cleanFilesOnError
];


export const updateDriverStatus = async (req, res) => {
  const { id } = req.params;
  const { status, failerMessage, failerSection } = req.body;

  try {
    // Check if driver exists
    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    // Update fields
    if (status) driver.status = status;
    if (failerMessage !== undefined) driver.failerMessage = failerMessage;
    if (failerSection !== undefined) driver.failerSection = failerSection;

    // Additional validation for incomplete/block status
    if ((status === 'incomplete' || status === 'block') && !failerSection) {
      return res.status(400).json({
        error: 'Failure section is required when status is incomplete or blocked.'
      });
    }

    // Reset failure fields if status is being changed to active/pending
    if (status === 'active' || status === 'pending') {
      driver.failerMessage = undefined;
      driver.failerSection = undefined;
    }

    // Save changes
    await driver.save();

    res.status(200).json({ message: 'Driver updated successfully.', driver });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Server error while updating driver.' });
  }
};

export const updateVerificationStageByPhone = async (req, res) => {
  const { phone } = req.params;

  try {
    // Check if driver exists with the given phone number
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found with the provided phone number.' });
    }

    // Update verification stage to "submit"
    driver.verificationStage = "submit";
    driver.status = "pending"
    driver.failerMessage = ""
    driver.failerSection = ""
    // Save changes
    await driver.save();

    res.status(200).json({
      message: 'Driver verification stage updated successfully to "submit".',
      driver
    });
  } catch (error) {
    console.error('Error updating driver verification stage:', error);
    res.status(500).json({
      error: 'Server error while updating driver verification stage.'
    });
  }
};

export const getCurrentDriver = async (req, res) => {
  try {
    const token = req.cookies.driverToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    const decoded = jwt.verify(token, process.env.DRIVER_JWT_SECRET);

    const driver = await Driver.findById(decoded.id)        // Excludes the password field from the returned document
      .populate("pilotType")             // Populates the 'plan' reference field
      .populate("bank");            // Populates the 'bank' reference field

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    return res.status(200).json({
      success: true,
      driver
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};
