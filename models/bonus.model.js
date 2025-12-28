import mongoose from "mongoose";

const BonusSchema = new mongoose.Schema({
      vendor : {
         type : mongoose.Schema.Types.ObjectId,
         ref : "Vendor"
      },
      amount : {
        type : String,
        required : true
      },
      reason : {
        type : String,
        required : true
      }
}, { timestamps: true });

// Prevent model overwrite in development
const Bonus = mongoose.models.Bonus || mongoose.model("Bonus", BonusSchema);

export default Bonus;