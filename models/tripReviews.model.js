import mongoose from "mongoose";

const TripReviewsSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
    },
    order : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        required : true
    },
    vendor: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Vendor",
        required : true
    },
    checked: {
        type: Boolean,
        default: false
    },
    feedbackDate: {
        type: String,
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MyDriver"
    },
    rating: {
        type: String,
        required: true,
        enum: ["horrible", "poor", "average", "good", "excellent"]
    },
    penalty: {
        type: String
    },
    vendorComment: {
        type: String
    },
    customerComment : {
        type : String
    }
}, { timestamps: true });

const TripReviews = mongoose.models.TripReviews || mongoose.model("TripReviews", TripReviewsSchema);

export default TripReviews;
