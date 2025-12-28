import mongoose from "mongoose";

const FleetPlanSchema = new mongoose.Schema({
  // MongoDB ObjectId (automatically created, no need to declare explicitly)
  category: { type: String, required: true },  // e.g. "BASIC"
  name: { type: String, required: true },      // e.g. "SILVER"
  price: { type: String, required: true },     // e.g. "₹5,000"
  originalPrice: { type: String },              // e.g. ""
  fleets: { type: String, required: true },    // e.g. "Upto 5 fleets"
  services: { type: String, required: true },  // e.g. "Airport Transfers"
  commission: { type: String, required: true },// e.g. "10% commission"
  support: { type: String, required: true },   // e.g. "Mail support"
  validity: { type: String, required: true },  // e.g. "6 months"
  incentives: { type: String },                 // e.g. ""
  buttonVariant: { type: String, required: true }, // e.g. "silver"
  badgeColor: { type: String, required: true },    // e.g. "bg-gray-100 text-gray-800 border border-gray-300"
  cardBorder: { type: String, required: true },    // e.g. "border-gray-300"
  popular: { type: Boolean, default: false },       // e.g. false
  featured: { type: Boolean, default: false },      // e.g. false
}, { timestamps: true });

// Prevent model overwrite in development
const FleetPlan = mongoose.models.FleetPlan || mongoose.model("FleetPlan", FleetPlanSchema);

export default FleetPlan;
