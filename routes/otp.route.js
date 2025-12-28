import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";

const otpRouter = express.Router();

otpRouter.post("/get-otp", sendOtp)
otpRouter.post("/verify-otp", verifyOtp)

export default otpRouter;