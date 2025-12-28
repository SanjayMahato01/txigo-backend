import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor'
    },
   newVendor : {
        type: String,
        required: true,
        ref: "Vendor"
    }
}, { timestamps: true });

const Referral = mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);

export default Referral;
