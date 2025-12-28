import express from "express";
import { getBlog, updateBlog } from "../controllers/blog.controller.js";

const blogRouter = express.Router();

blogRouter.get("/get-blog", getBlog)
blogRouter.put("/update-blog", updateBlog)

export default blogRouter;