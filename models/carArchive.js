import mongoose from 'mongoose';

const CarArchiveSchema = new mongoose.Schema({
  // Copy all fields from VendorCar schema
  carType: { type: String, required: true },
  carModal: { type: String, required: true },
  carVarient: { type: String, required: true },
  sitCapacity: { type: String, required: true },
  carRcNumber: { type: String, required: true },
  carNumber: { type: String, required: true },
  taxValidUpto: { type: String, required: true },
  image: { type: String },
  carRcBothSide: { type: String },
  vendor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vendor",
    required: true
  },
  status: { type: String, default: "Available" },
  currentBooking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order",
    default: null 
  },

  // Archive-specific fields
  originalCarId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  deletionReason: { 
    type: String, 
    required: true 
  },
  deletedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Preserve original timestamps
  createdAt: { type: Date },
  updatedAt: { type: Date }
}, {
  // Enable automatic timestamps for createdAt and updatedAt
  timestamps: true
});

export default mongoose.models.CarArchive || 
       mongoose.model('CarArchive', CarArchiveSchema);