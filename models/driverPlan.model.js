import mongoose from "mongoose";

const DriverPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price : {
      type : Number,
      required : true
    },
    gst: {
      type: Number,  
      required: true
    },
    commission: {
      type: Number, 
      required: true
    },
    penalty: {
      type: Number,  // Fixed: changed 'number' to 'Number'
      required: true
    }
  },
  { timestamps: true }
);

// Prevent model overwrite in development
const DriverPlan =
  mongoose.models.DriverPlan || mongoose.model("DriverPlan", DriverPlanSchema);

export default DriverPlan;