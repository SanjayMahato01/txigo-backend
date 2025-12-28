import express from "express";
import { assignPlan, forgotPassword, getAllVendors, getLoggedInVendor, getOneVendor, getWalletBalance, loginVendor, logoutVendor, resetPassword, sendVendorOTP, updateVendor, updateVendorDetails,  updateVendorPlan,  updateVendorStatus,  updateWalletBalance,  verifyVendorOTP } from "../controllers/vendor.controller.js";
const vendorRouter = express.Router();

vendorRouter.post('/login', loginVendor)
vendorRouter.post('/logout', logoutVendor)
vendorRouter.post('/send-otp', sendVendorOTP)
vendorRouter.post('/verify-otp', verifyVendorOTP)
vendorRouter.post('/forgot-password', forgotPassword)
vendorRouter.post('/reset-password', resetPassword)
vendorRouter.put('/add-details/:id', updateVendorDetails)
vendorRouter.put('/add-plan/:vendorId', assignPlan)
vendorRouter.get('/getAll', getAllVendors)
vendorRouter.get('/getOne/:id', getOneVendor)
vendorRouter.patch('/update-one/:id', updateVendor)
vendorRouter.patch('/update-plan', updateVendorPlan)
vendorRouter.patch('/update-status/:vendorId', updateVendorStatus)
vendorRouter.get('/getLoggedInVendor', getLoggedInVendor)
vendorRouter.get('/getWalletBalance/:vendorId', getWalletBalance)
vendorRouter.put('/updateWalletBalance', updateWalletBalance)

export default vendorRouter;