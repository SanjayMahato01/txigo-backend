import speakeasy from "speakeasy";
import { sendOTPEmail } from "../utils/mailer.js";


const otpStore = new Map();
const otpExpiryTime = 300000;

// Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  // Generate secret and OTP
  const secret = speakeasy.generateSecret({ length: 20 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
    step: 300, 
  });

  // Store OTP with the email and the timestamp of creation
  otpStore.set(email, { secret: secret.base32, timestamp: Date.now() });

  try {
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

// Verify OTP
export const verifyOtp = (req, res) => {
  const { email, token } = req.body;

  // Retrieve secret and timestamp
  const otpData = otpStore.get(email);
  
  if (!otpData) {
    return res.status(400).json({ error: "OTP not found or expired." });
  }

  // Check if OTP is expired
  const currentTime = Date.now();
  const otpAge = currentTime - otpData.timestamp;
  if (otpAge > otpExpiryTime) {
    otpStore.delete(email); // Clean up expired OTP
    return res.status(400).json({ error: "OTP has expired, please request a new one." });
  }

  // Verify OTP
  const verified = speakeasy.totp.verify({
    secret: otpData.secret,
    encoding: "base32",
    token,
    window: 1, // Allow a small window of leeway for OTP generation
    step: 300, // Expiry time window
  });

  if (verified) {
    otpStore.delete(email); // Remove OTP after successful verification
    res.json({success:true, message: "OTP verified successfully." });
  } else {
    res.status(400).json({ error: "Invalid or expired OTP." });
  }
};
