import mongoose from "mongoose"

const OneWayCabsSchema = new mongoose.Schema({
    zone: {
        type: String,
        required: true,
        enum: ["east", "west", "south", "north", "central"]
    },
    cityType: {
        type: String,
        required: true
    },
    city: {
        cityName: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
        },

        price: {
            type: String,
            required: true
        }
    }
});


const OneWayCabs = new mongoose.model("OneWayCabs", OneWayCabsSchema);

export default OneWayCabs;