import express from "express";
import {
  createBlogCategory,
  getAllBlogCategories,
  updateBlogCategory,
  deleteBlogCategory
} from "../controllers/blogCategory..controller.js";

const blogCategoryRouter = express.Router();

blogCategoryRouter.post("/categories", createBlogCategory);
blogCategoryRouter.get("/categories", getAllBlogCategories);
blogCategoryRouter.put("/categories/:id", updateBlogCategory);
blogCategoryRouter.delete("/categories/:id", deleteBlogCategory);

export default blogCategoryRouter;
