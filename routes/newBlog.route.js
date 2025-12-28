import express from "express";
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    toggleLike,
    getBlogByUrlEndpoint,
    getBlogsByTag,
    getBlogsByCategory,

} from "../controllers/newBlog.controller.js";
import { blogImageUploader, cleanFilesOnError } from "../middleware/uploadMiddleware.js";

const newBlogrouter = express.Router();

// Create blog with images
newBlogrouter.post("/create",
    blogImageUploader,
    cleanFilesOnError,
    createBlog
);

// Get all blogs
newBlogrouter.get("/blogs", getAllBlogs);

// Get single blog
newBlogrouter.get("/blogs/:id", getBlogById);

newBlogrouter.get("/blogs/url/:urlEndpoint", getBlogByUrlEndpoint);

// Update blog (with optional images)
newBlogrouter.put("/update/:id",
    blogImageUploader,
    cleanFilesOnError,
    updateBlog
);

// Delete blog
newBlogrouter.delete("/delete/:id", deleteBlog);

// Like/unlike blog
newBlogrouter.post("/like/:id", toggleLike);

// get blogs by tag
newBlogrouter.get("/tag/:tag", getBlogsByTag);

// get blogs by category
newBlogrouter.get("/category/:categoryId", getBlogsByCategory);

export default newBlogrouter;