import mongoose from "mongoose"

const DriverContentSchema = new mongoose.Schema({
    cityName: {
        type: String,
        required: true
    },
    content: [
        {
            title : String,
            description : String
        }
    ],
},{timestamps : true});

const DriverContent = new mongoose.model("DriverContent", DriverContentSchema);

export default DriverContent;