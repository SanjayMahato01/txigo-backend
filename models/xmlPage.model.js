import mongoose from 'mongoose';

const XmlPageSchema = new mongoose.Schema({
  pageName : {
    type : String,
    required : true
  },
  url : {
    type : String,
    required : true
  }
}, { timestamps: true });

export default mongoose.model('XmlPage', XmlPageSchema);