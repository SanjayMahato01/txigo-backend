import mongoose from "mongoose"

const HeadingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    headingType: {
        type: String,
        required: true
    }
});

const Heading = new mongoose.model("Heading", HeadingSchema);

export default Heading;