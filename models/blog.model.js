import mongoose from "mongoose"

const BlogSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
   description: {
    type : String,
    required : true
   }
});

 const Blog = new mongoose.model("Blog", BlogSchema);

 export default Blog;