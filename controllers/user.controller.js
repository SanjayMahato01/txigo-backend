
import User from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import jwt from 'jsonwebtoken';

export const signupUser = async (req, res) => {
  try {
    const { name, email, phone, verified } = req.body;

    if (!name || !email || !phone || typeof verified !== "boolean") {
      return res.status(400).json({ message: "All fields including 'verified' are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.verified && !verified) {

        return res.status(400).json({ message: "User is not verified. Cannot log in." });

      }

      // If user is verified, log them in
      if (existingUser.verified) {
        const accessToken = await generateAccessToken(existingUser._id);
        const refreshToken = await generateRefreshToken(existingUser._id);

        const frontendDomain = new URL(process.env.FRONTEND_URL).hostname.replace(/^www\./, "");

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 15 * 60 * 1000,
          domain: `.${frontendDomain}`,
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 30 * 24 * 60 * 60 * 1000,
          domain: `.${frontendDomain}`,
        });


        return res.status(200).json({
          success: true,
          message: "User logged in successfully",
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone,
          },
        });
      }


      return res.status(400).json({ message: "User is not verified. Please verify your email first." });

    } else {
      // Case: New user, create a new account
      if (!verified) {
        return res.status(400).json({ message: "User is not verified. Cannot register." });
      }

      const newUser = new User({
        name,
        email,
        phone,
        verified: true,
      });

      await newUser.save();

      const accessToken = await generateAccessToken(newUser._id);
      const refreshToken = await generateRefreshToken(newUser._id);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        message: "User registered and logged in successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
        },
      });
    }

  } catch (error) {
    console.error("Signup/Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const isProduction = process.env.NODE_ENV

export const loginUser = async (req, res) => {
  const isProduction = process.env.NODE_ENV

  try {
    const { name, email, phone, verified } = req.body;

    if (!name || !phone || typeof verified !== "boolean") {
      return res.status(400).json({
        message: "Name, phone, and verification status are required",
      });
    }

    let isNewUser = false;
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user if not found
      isNewUser = true;
      user = await User.create({
        name,
        email: email || null,
        phone,
        verified,
      });
    } else {
      // If existing user, check for updates
      let needsUpdate = false;

      if (name && name !== user.name) {
        user.name = name;
        needsUpdate = true;
      }
      if (email && email !== user.email) {
        user.email = email;
        needsUpdate = true;
      }
      if (verified !== user.verified) {
        user.verified = verified;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
      }
    }

    // Create JWT
    const payload = { id: user._id, name: user.name };
    const token = jwt.sign(payload, process.env.USER_JWT_SECRET, {
      expiresIn: "30d",
    });

    // Cookie
    res.cookie('UserToken', token, {
      domain: isProduction ? ".txigo.com" : "localhost",
      httpOnly: true,
      secure: true, // set false for local dev if needed
      sameSite: 'none', // change to 'lax' or 'strict' depending on frontend/backend domains
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser
        ? "User registered successfully"
        : "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies?.UserToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // 3. Find user in DB
    const user = await User.findById(decoded.id).select("-__v"); // exclude __v
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Return user
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addOrderToUser = async (req, res) => {
  try {
    const { userId, orderId } = req.body;

    if (!userId || !orderId) {
      return res.status(400).json({ message: "User ID and Order ID are required" });
    }

    // Push orderId into user's orders array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { orders: orderId } },
      { new: true }
    ).populate("orders");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order ID added to user's orders",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error adding order to user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "No Refresh Token",
        error: true,
        success: false
      });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);


    const newAccessToken = await generateAccessToken(payload.id);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({
      message: "Refresh token expired or invalid",
      error: true,
      success: false
    });
  }
};

export const getUserWithOrders = async (req, res) => {
  try {
    const { userId } = req.params; // Driver's _id from URL

    const driver = await User.findById(userId)
      .populate({
        path: "orders", // User schema should have: orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
      })
      .sort({ createdAt: -1 });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({
      success: true,
      driver,
      orders: driver.orders || [],
    });
  } catch (error) {
    console.error("Get driver with orders error:", error);
    res.status(500).json({ message: "Server error while fetching driver orders" });
  }
};
