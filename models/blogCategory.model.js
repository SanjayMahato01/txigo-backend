import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
    
    pinNumber: {
        type: String,
        required: true,
        unique: true
    },
    metaData: {
        type: String, 
        required: true
    },
}, { 
    timestamps: true,
});

const blogCategory = mongoose.models.BlogCategory || mongoose.model("BlogCategory", CategorySchema);

export default blogCategory;
