import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    date: {
      type: String,
     
    },
    tripType: {
      type: String,
     
    },
    gstNo: {
      type: String,
     
    },
    invoiceNo: {
      type: String,

    },
    customerName: {
      type: String,
   
    },
    number: {
      type: String,

    },
    email: {
      type: String,
    },
    tripFare: {
      type: Number, // changed from String to Number
   
    },
    tax: {
      type: Number, // changed from String to Number

    },
    totalPaid: {
      type: Number, // changed from String to Number
 
    },
    brandName: {
      type: String,
    
    },
    pdfUrl : {
      type : String
    }
  },
  { timestamps: true }
);

// Prevent model overwrite in development
const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;
