import mongoose from "mongoose"

const PromotionalEmailSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true
  },
  email: {
    type : String,
    required : true
  },
  phone: {
    type : String,
    required : true
  },
  bookingType: {
    type: String,
    required: true,
  },
  pickup: {
    type: String,
    required: true,
  },
  drop: {
    type: String
  },
  redirectPath : {
    type : String,
    required : true
  },
}, { timestamps: true }); 
const PromotionalEmail = new mongoose.model("PromotionalEmail", PromotionalEmailSchema);

export default PromotionalEmail;