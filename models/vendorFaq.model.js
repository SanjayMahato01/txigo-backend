import mongoose from "mongoose";

const VendorFaqSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const VendorFaq = mongoose.models.VendorFaq || mongoose.model("VendorFaq", VendorFaqSchema);

export default VendorFaq;
