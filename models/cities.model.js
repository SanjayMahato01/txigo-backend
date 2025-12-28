import mongoose from "mongoose"

const CitiesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    acSedans: {
      type: String,
      required: true
    },
    acSUVsAndMUVs: {
      type: String,
      required: true
    },
    premiumSUVs: {
      type: String,
      required: true
    },
    acTempoTravellers: {
      type: String,
      required: true
    }
  }
});

const Cities = new mongoose.model("Cities", CitiesSchema);

export default Cities