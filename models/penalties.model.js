import mongoose from "mongoose";

const PenaltiesSchema= new mongoose.Schema({
    bookingId: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
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
    },
    description : {
        type : String,
        required : true
    },
    reversed : {
        type : Boolean,
        default : false
    }
}, { timestamps: true });

const Penalties= mongoose.models.Penalties || mongoose.model("Penalties", PenaltiesSchema);

export default Penalties;
