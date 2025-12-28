import mongoose from "mongoose";

const PageFaqSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  content: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      }
    }
  ]
}, { timestamps: true });

const PageFaq = mongoose.models.PageFaq || mongoose.model("PageFaq", PageFaqSchema);

export default PageFaq;
