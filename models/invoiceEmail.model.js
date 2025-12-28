import mongoose from "mongoose";

const InvoiceEmailSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        pdfUrl: {
            type: String
        }
    },
    { timestamps: true }
);

// Prevent model overwrite in development
const InvoiceEmail =
    mongoose.models.InvoiceEmail || mongoose.model("InvoiceEmail", InvoiceEmailSchema);

export default InvoiceEmail;
