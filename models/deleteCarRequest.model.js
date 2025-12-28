import mongoose from "mongoose"

const DeleteCarRequestSchema = new mongoose.Schema({
    car : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "VendorCars",
        required : true
    },
    reason : {
        type : String,
    },
     vendor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Vendor"
     }
},{timestamps : true});

const DeleteCarRequest = new mongoose.model("DeleteCarRequest", DeleteCarRequestSchema);

export default DeleteCarRequest