import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  fullName: { type: String },
  BusinessName: { type: String },
  BusinessAddress: { type: String },
  city: { type: String },
  state: { type: String },
  pinCode: { type: String },
  tradeLicense: { type: String },
  gstNumber: { type: String },
  PanNumber: { type: String },
  AadharNumber: { type: String },

  plan: {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "FleetPlan" },
    purchasedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },

  fleetAllowed: { type: String, default: "2" },
  driverAllowed: { type: String, default: "2" },
  walletBalance: { type: String, default: "0" },

  vendorCod: {
    lat: { type: String },
    lng: { type: String },
  },

  status: {
    current: { type: String, enum: ["pending", "blocked", "active"], default: "active" },
    reason: { type: String },
  },

  earnings: { type: String },
  coins: { type: String, default: "0" },
  referalCode: { type: String },
}, { timestamps: true });


// ✅ Auto-generate 6-digit referral code if not provided
VendorSchema.pre('save', async function (next) {
  if (!this.referalCode) {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.referalCode = randomCode;
  }
  next();
});

// ✅ Static method for filtering vendors with valid plans
VendorSchema.statics.findWithActivePlan = function (filter = {}) {
  const now = new Date();
  return this.find({
    ...filter,
    $or: [
      { 'plan.isActive': false },
      {
        'plan.isActive': true,
        'plan.expiresAt': { $gt: now }
      }
    ]
  });
};

// ✅ Register model
const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);

export default Vendor;


// ✅ Background job to deactivate expired plans
function startPlanCleanupJob() {
  setInterval(async () => {
    try {
      const result = await Vendor.updateMany(
        {
          'plan.expiresAt': { $lte: new Date() },
          'plan.isActive': true
        },
        { $set: { 'plan.isActive': false } }
      );
;
    } catch (error) {
      console.error("Plan cleanup job failed:", error);
    }
  }, 60 * 60 * 1000); // every hour
}

startPlanCleanupJob();
