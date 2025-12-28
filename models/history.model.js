import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
    HistoryType: {
        type: String,
        required: true
    },
    description : {
        type : String,
        required : true
    }
}, { timestamps: true });

const History = mongoose.models.History || mongoose.model("History", HistorySchema);

export default History;
