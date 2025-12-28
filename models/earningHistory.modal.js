import mongoose from "mongoose";

const earningHistorySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    amount: {
      type: String, 
      required: true
    },
    historyType : {
        type : String,
        required : true
    },
    orderId : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    }
  },
  { timestamps: true }
);

// Prevent model overwrite in development
const earningHistory =
  mongoose.models.earningHistory ||
  mongoose.model("earningHistory", earningHistorySchema);

export default earningHistory;
