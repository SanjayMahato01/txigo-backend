import mongoose from "mongoose";

const MyDriverSchema = new mongoose.Schema({
  driverName: {
    type: String,
    required: true,
  },
  driverVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor"
  },
  driverAddress: {
    type: String,
    required: true,
  },
  driverPin: {
    type: String,
    required: true,
  },
  driverMobileNo: {
    type: String,
    required: true,
  },
  driverEmail: {
    type: String,
    required: true,
  },
  alternativeName: {
    type: String,
    required: true,
  },
  alternativePhone: {
    type: String,
    required: true,
  },
  relationshipWithAlternative: {
    type: String,
    required: true,
  },
  aadharNumber: {
    type: String,
    required: true,
  },
  assignedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  aadharFrontImage: {
    type: String, // URL or base64 string
  },
  aadharBackImage: {
    type: String,
  },
  panNumber: {
    type: String,
    required: true,
  },
  panFrontImage: {
    type: String,
  },
  panBackImage: {
    type: String,
  },
  drivingLicenseNumber: {
    type: String,
    required: true,
  },
  drivingLicenseValidity: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Approved", "Pending","Rejected"],
    default: "Pending"
  },
  drivingLicenseFrontImage: {
    type: String,
  },
  nps : {
    type : String,
    default : "0"
  },
  currentBooking : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  drivingLicenseBackImage: {
    type: String,
  },
}, { timestamps: true });

// Prevent model overwrite in development
const MyDriver = mongoose.models.MyDriver || mongoose.model("MyDriver", MyDriverSchema);

export default MyDriver;
