import mongoose from "mongoose";

const VendorCarsSchema = new mongoose.Schema({
  carType: {
    type: String,
    required: true,
  },
  carModal: {
    type: String,
    required: true,
  },
  carVarient: {
    type: String,
    required: true, // Petrol diesel CNG EV
  },
  sitCapacity: {
    type: String,
    required: true,
  },
  carRcNumber: {
    type: String,
    required: true,
  },
  carNumber: {
    type: String,
    required: true,
  },
  taxValidUpto: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  carRcBothSide: {
    type: String,
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: "Order"
  },
  vendor: {
    type: mongoose.Schema.ObjectId,
    ref: "Vendor",
    required : true
  }
}, { timestamps: true });

// Prevent model overwrite in development
const VendorCars = mongoose.models.VendorCars || mongoose.model("VendorCars", VendorCarsSchema);

export default VendorCars;
