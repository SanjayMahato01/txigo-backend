import mongoose from 'mongoose';

const WebStoriesSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  videos: [
    {
      url: {
        type: String,
        required: true, 
      },
    },
  ],
}, { timestamps: true });

export default mongoose.model('WebStories', WebStoriesSchema);