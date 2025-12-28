import mongoose from "mongoose";

const NewBlogSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogCategory",
    required: true
  },
  blogTitle: {
    type: String,
    required: true,
  },
  urlEndpoint: {
    type: String,
    required: true,
    unique: true
  },
  orderNumber: {
    type: String,
    required: true,
  },
  categoryOrderNumber: {
    type: String,
    required: true,
  },
  visiblity: {
    type: Boolean,
    default: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  metaData: {
    type: String,
    required: true
  },
  blogItems: [
    {
      heading: {
        type: String,
        required: true
      },
      image: {
        url: {
          type: String,
        },
        height: {
          type: String,
        },
        altTag: {
          type: String,
        }
      }
    }
  ],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags : [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const NewBlog = mongoose.models.NewBlog || mongoose.model("NewBlog", NewBlogSchema);

export default NewBlog;
