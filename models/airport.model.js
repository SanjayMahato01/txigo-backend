import mongoose, { Schema } from 'mongoose';


const airportSchema = new Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
});


const Airport = mongoose.model('Airport', airportSchema);

export default Airport;
