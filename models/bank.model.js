import mongoose from "mongoose"

const BankSchema = new mongoose.Schema({
    vendorId : {
      type: mongoose.Schema.Types.ObjectId,
      required : true,
      ref : "Vendor",
      unique: true,
    },
    fullName : {
        type : String,
        required : true
    },
   bankName: {
    type : String,
    required : true
   },
   bankNumber: {
    type : String,
    required : true
   },
   ifscCode: {
    type : String,
    required : true
   },
   upiNumber : {
    type : String,
    required : true
   },
   upiAddress : {
    type : String,
    required : true
   }
});

 const Bank = new mongoose.model("Bank", BankSchema);

 export default Bank;