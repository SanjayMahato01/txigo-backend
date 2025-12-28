import mongoose from 'mongoose';

const DriverArchiveSchema = new mongoose.Schema({
  // Copy all fields from MyDriverSchema
  driverName: { type: String, required: true },
  driverVendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  driverAddress: { type: String, required: true },
  // Include all other fields from MyDriverSchema...
  
  // Archive-specific fields
  originalDriverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  deletionReason: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now },
  
  // Preserve original timestamps
  createdAt: { type: Date },
  updatedAt: { type: Date }
});

export default mongoose.models.DriverArchive || 
       mongoose.model('DriverArchive', DriverArchiveSchema);