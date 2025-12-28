import express from "express";
import {
  createPageContent,
  getAllPages,
  getPageById,
  updatePageContent,
  deletePageContent,
  checkPageContent, // Add this import
  updatePageByUrl
} from "../controllers/pageContent.controller.js";

const pageContent = express.Router();

// Add this new route before the others
pageContent.get("/check", checkPageContent);

// Keep all your existing routes exactly as they are
pageContent.post("/create", createPageContent);
pageContent.get("/", getAllPages);
pageContent.get("/:id", getPageById);
pageContent.put("/update/:id", updatePageContent);
pageContent.delete("/:id", deletePageContent);

pageContent.put("/update-by-url", updatePageByUrl);
export default pageContent;