import mongoose from "mongoose";

const incentiveSchema = new mongoose.Schema({
      vendor : {
         type : mongoose.Schema.Types.ObjectId,
         ref : "Vendor"
      },
      amount : {
        type : String,
        required : true
      },
      description : {
        type : String,
        required : true
      }
}, { timestamps: true });

// Prevent model overwrite in development
const Incentive = mongoose.models.Incentive || mongoose.model("Incentive", incentiveSchema);

export default Incentive;
