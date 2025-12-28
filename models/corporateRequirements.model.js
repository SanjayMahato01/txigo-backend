import mongoose from "mongoose"

const CorporateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    business_volumes: {
        type: String,
        required: true
    }
});

const Corporate = new mongoose.model("Corporate", CorporateSchema);

export default Corporate;