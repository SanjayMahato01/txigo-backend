import express from "express";
import {
  createDriver,
  getAllDrivers,
  saveReferralCode,
  sendOtp,
  updateDriverProfile,
  verifyOtp,
  updateVehicleInfo,
  updateDriverDocuments,
  updateDriverDocumentsWithCleanup,
  getDriverById,
  updateVehicleInfoById,
  updateDriverDocumentsByIdWithCleanup,
  updateDriverDocumentsById,
  updateDriverStatus,
  updateVerificationStageByPhone,
  getDriverByPhone,
  getCurrentDriver,
  updateDriverProfileById
} from "../controllers/driver.controller.js";
import { 
  vehicleImageUploader,
  documentImageUploader 
} from "../middleware/uploadMiddleware.js"

const driverRouter = express.Router();

// Driver routes
driverRouter.post("/create", createDriver);
driverRouter.get("/getAll", getAllDrivers);
driverRouter.post("/send-otp", sendOtp);
driverRouter.post("/verify-otp", verifyOtp);
driverRouter.post("/referral", saveReferralCode);
driverRouter.post("/updateProfile", updateDriverProfile);
driverRouter.get("/getDriverById/:id", getDriverById);
driverRouter.put("/updateProfileById/:id", updateDriverProfileById);
driverRouter.get("/getCurrentDriver", getCurrentDriver);
// Vehicle routes with image upload
driverRouter.put(
  "/updateVehicleClient",
  vehicleImageUploader, // Handles file uploads
  updateVehicleInfo    // Processes the uploaded files
);

// Documents routes with image upload and cleanup
driverRouter.put(
  "/updateDocumentsClient",
   documentImageUploader, // Handles document image uploads
  updateDriverDocumentsWithCleanup // Processes and handles cleanup
);

driverRouter.put(
  "/updateVehicle/:id",
  updateVehicleInfoById, // Handles file uploads
  updateVehicleInfoById    // Processes the uploaded files
);

// Documents routes with image upload and cleanup
driverRouter.put(
  "/updateDocuments/:id",
   updateDriverDocumentsById, // Handles document image uploads
  updateDriverDocumentsByIdWithCleanup // Processes and handles cleanup
);

driverRouter.put("/updateDriverStatus/:id",updateDriverStatus)

driverRouter.put("/updateVerificationStage/:phone",updateVerificationStageByPhone)
driverRouter.get("/getDriverByPhone/:phone",getDriverByPhone)




export default driverRouter;