import express from "express";
import {
  createPageFaq,
  getAllPageFaqs,
  getPageFaqById,
  getPageFaqByUrl,
  updatePageFaq,
  deletePageFaq,
  getPageFaqByUrlAndPageName
} from "../controllers/pageFaq.controller.js";

const pageFaqRouter = express.Router();

// Create a new FAQ page
pageFaqRouter.post("/", createPageFaq);

// Get all FAQ pages
pageFaqRouter.get("/", getAllPageFaqs);

// Get a single FAQ page by ID
pageFaqRouter.get("/:id", getPageFaqById);

// Get a single FAQ page by URL
pageFaqRouter.get("/url/:url", getPageFaqByUrl);

// Update a FAQ page
pageFaqRouter.put("/:id", updatePageFaq);

// Delete a FAQ page
pageFaqRouter.delete("/:id", deletePageFaq);

pageFaqRouter.get("/getByUrlAndFaq/:pageName/:url", getPageFaqByUrlAndPageName);


export default pageFaqRouter;