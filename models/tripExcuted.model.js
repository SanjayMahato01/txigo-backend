import mongoose from "mongoose";

const TripExecutedSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    carType: {
        type: String,
        required: true,
    },
    startDate: {
        type: String,
        required : true
    },
    startTime : {
        type : String,
        required : true
    },
    endDate: {
        type: String,
        required : true
    },
      endTime : {
        type : String,
        required : true
    },
    status : {
          type: String,
          enum : ["not-billed", "billed", "cancelled"]
    },
    cashCollected : {
        type : String,
        required : true
    },
    vendorCost : {
        type : String,
        default : '0'
    },
    finalAmount : {
        type : String,
        required : true
    },
    driver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "MyDriver",
        required : true
    },
    vendor: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Vendor",
        required : true
    }
}, { timestamps: true });

const TripExecuted = mongoose.models.TripExecuted || mongoose.model("TripExecuted", TripExecutedSchema);

export default TripExecuted;
