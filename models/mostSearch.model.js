import mongoose from "mongoose"

const SearchSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true
  },
  email: {
    type : String,
    required : true
  },
  phone: {
    type : String,
    required : true
  },
  bookingType: {
    type: String,
    required: true,
  },
  pickup: {
    type: String,
    required: true,
  },
  drop: {
    type: String,
  },
  pickupDate: {
    type: String,
    required: true, // was `require`, fixed to `required`
  },
  pickupTime: {
    type: String,
    required: true, 
  },
  returnDate: {
    type: String,
  },
  package: {
    type: String,
  },
}, { timestamps: true }); 
const Search = new mongoose.model("Search", SearchSchema);

export default Search;