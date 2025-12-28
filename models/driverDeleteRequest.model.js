import mongoose from "mongoose"

const DriverDeleteRequestSchema = new mongoose.Schema({
    driver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "MyDriver",
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

const DriverDeleteRequest = new mongoose.model("DriverDeleteRequest", DriverDeleteRequestSchema);

export default DriverDeleteRequest