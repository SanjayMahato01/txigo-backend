import WebStories from "../models/webStories.model.js";
import { processFiles } from "../middleware/uploadMiddleware.js";
import fs from 'fs';
import path from 'path';

// Helper to extract filename from URL
const getFilenameFromUrl = (url) => url.split('/').pop();

// Helper to delete files
const deleteVideoFile = (filename) => {
  const filePath = path.join(process.cwd(), 'uploads', 'web-stories', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const createWebStory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    // Validation
    if (!categoryName?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Process uploaded files using your existing middleware
    const uploadedVideos = processFiles(req, "web-stories");

    if (uploadedVideos.length === 0) {
      return res.status(400).json({ error: "At least one video is required" });
    }

    // Create web story
    const newStory = new WebStories({
      categoryName: categoryName.trim(),
      videos: uploadedVideos.map(file => ({ url: file.url }))
    });

    const savedStory = await newStory.save();

    res.status(201).json({
      success: true,
      message: "Web story created successfully",
      data: savedStory
    });

  } catch (error) {
    console.error("Error creating web story:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// update 
export const updateWebStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, videosToRemove } = req.body;

    // Find existing story
    const existingStory = await WebStories.findById(id);
    if (!existingStory) {
      return res.status(404).json({ error: "Web story not found" });
    }

    // Process new uploads
    const newVideos = processFiles(req, "web-stories").map(file => ({
      url: file.url
    }));

    // Ensure videosToRemove is an array
    const videosToRemoveArray = Array.isArray(videosToRemove) 
      ? videosToRemove 
      : (videosToRemove ? [videosToRemove] : []);

    // Filter out videos to keep
    const keptVideos = existingStory.videos.filter(
      video => !videosToRemoveArray.includes(video.url)
    );

    // Cleanup removed files
    videosToRemoveArray.forEach(url => {
      if (url) { // Add null check
        deleteVideoFile(getFilenameFromUrl(url));
      }
    });

    // Update story
    const updatedStory = await WebStories.findByIdAndUpdate(
      id,
      {
        categoryName: categoryName?.trim() || existingStory.categoryName,
        videos: [...keptVideos, ...newVideos]
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Web story updated successfully",
      data: updatedStory
    });

  } catch (error) {
    console.error("Error updating web story:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

export const deleteWebStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await WebStories.findByIdAndDelete(id);
    if (!story) {
      return res.status(404).json({ error: "Web story not found" });
    }

    // Cleanup all video files
    story.videos.forEach(video => {
      deleteVideoFile(getFilenameFromUrl(video.url));
    });

    res.status(200).json({
      success: true,
      message: "Web story deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting web story:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Add these to your existing controller

export const getAllWebStories = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    const query = {};
    if (category) {
      query.categoryName = { $regex: category, $options: 'i' };
    }

    const stories = await WebStories.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
   
    const count = await WebStories.countDocuments(query);

    res.status(200).json({
      success: true,
      data: stories,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("Error fetching web stories:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

export const getWebStoryById = async (req, res) => {
  try {
    const story = await WebStories.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ 
        success: false,
        error: "Web story not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: story
    });

  } catch (error) {
    console.error("Error fetching web story:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};