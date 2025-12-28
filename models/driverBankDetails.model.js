import mongoose from "mongoose"

const DriverBankDetailsSchema = new mongoose.Schema({
    bankName: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    panNumber: {
        type: String,
        required: true
    }
}, { timestamps: true });

const DriverBankDetails = new mongoose.model("DriverBank", DriverBankDetailsSchema);

export default DriverBankDetails