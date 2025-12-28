import express from "express";
import {
  createWebStory,
  updateWebStory,
  deleteWebStory,
  getAllWebStories,
  getWebStoryById
} from "../controllers/webStories.controller.js";
import { videoUploader, cleanFilesOnError } from "../middleware/uploadMiddleware.js";

const webStoriesRouter = express.Router();

// Existing POST route (unchanged)
webStoriesRouter.post(
  "/add",
  videoUploader,
  cleanFilesOnError,
  createWebStory
);

// New GET routes
webStoriesRouter.get("/", getAllWebStories);          // Get all web stories
webStoriesRouter.get("/:id", getWebStoryById);        // Get single web story

// New PUT route for updates
webStoriesRouter.put(
  "/:id",
  videoUploader,
  cleanFilesOnError,
  updateWebStory
);

// New DELETE route
webStoriesRouter.delete(
  "/:id",
  deleteWebStory
);

export default webStoriesRouter;