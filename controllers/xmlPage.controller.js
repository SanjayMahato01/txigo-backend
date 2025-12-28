import mongoose from "mongoose";
import xmlPageModel from "../models/xmlPage.model.js";

export const createXmlPage = async (req, res, next) => {
  try {
    const { pageName, url } = req.body;

    // Validate input
    if (!pageName || !url) {
      return res.status(400).json({
        success: false,
        message: 'Both pageName and url are required'
      });
    }

    // Check if URL already exists
    const existingPage = await xmlPageModel.findOne({ url });
    if (existingPage) {
      return res.status(409).json({
        success: false,
        message: 'A page with this URL already exists'
      });
    }

    // Create new XML page
    const newXmlPage = await xmlPageModel.create({
      pageName,
      url
    });

    res.status(201).json({
      success: true,
      message: 'XML page created successfully',
      data: newXmlPage
    });

  } catch (error) {
    // Handle duplicate key errors (unique fields)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A page with this URL already exists',
        error: error.message
      });
    }
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }

    // Pass other errors to error handler middleware
    next(error);
  }
};

export const getAllXmlPages = async (req, res) => {
  try {
    const pages = await xmlPageModel.find({}).lean();
    
    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch XML pages'
    });
  }
};