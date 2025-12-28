import mongoose from "mongoose";

const TravelAgentSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
         type: String,
        required : true
    },
   password: {
         type: String,
        required : true
    },
    company_name : {
        type : String,
        required : true
    },
    company_city : {
        type : String,
        required : true
    }
}, { timestamps: true });

const TravelAgent = mongoose.models.TravelAgent || mongoose.model("TravelAgent", TravelAgentSchema);

export default TravelAgent;
