import mongoose from "mongoose";

const CorporateInvoiceSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    tripType: {
      type: String,
      required: true,
    },
    gstNo: {
      type: String,
      required: true,
    },
    invoiceNo: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    companyEmail: {
      type: String,
      required: true,
    },
    tripFare: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    totalPaid: {
      type: Number,
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    companyAddress: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in development
const CorporateInvoice =
  mongoose.models.CorporateInvoice ||
  mongoose.model("CorporateInvoice", CorporateInvoiceSchema);

export default CorporateInvoice;
