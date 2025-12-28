import PageContent from "../models/pageContent.model.js";

// Create new page content
export const createPageContent = async (req, res) => {
  try {
    const newPage = await PageContent.create(req.body);
    return res.status(201).json({ success: true, data: newPage });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get all page content
export const getAllPages = async (req, res) => {
  try {
    const pages = await PageContent.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: pages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single page by ID
export const getPageById = async (req, res) => {
  try {
    const page = await PageContent.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    return res.status(200).json({ success: true, data: page });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update page content
export const updatePageContent = async (req, res) => {
  try {
    const updatedPage = await PageContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPage) return res.status(404).json({ success: false, message: "Page not found" });
    return res.status(200).json({ success: true, data: updatedPage });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete page content
export const deletePageContent = async (req, res) => {
  try {
    const deletedPage = await PageContent.findByIdAndDelete(req.params.id);
    if (!deletedPage) return res.status(404).json({ success: false, message: "Page not found" });
    return res.status(200).json({ success: true, message: "Page deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkPageContent = async (req, res) => {
  try {
    const { pageName, url } = req.query;
    
    if (!pageName || !url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both pageName and url parameters are required' 
      });
    }

    const existingContent = await PageContent.findOne({ 
      pageName, 
      url 
    });

    return res.status(200).json({ 
      success: true, 
      exists: !!existingContent,
      data: existingContent || null 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add this new function to your controller
export const updatePageByUrl = async (req, res) => {
  try {
    const { pageName, url } = req.body;
    
    if (!pageName || !url) {
      return res.status(400).json({ 
        success: false, 
        message: 'pageName and url are required' 
      });
    }

    const updatedPage = await PageContent.findOneAndUpdate(
      { pageName, url },
      req.body,
      { new: true, runValidators: true, upsert: false }
    );

    if (!updatedPage) {
      return res.status(404).json({ 
        success: false, 
        message: "Page not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: updatedPage 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};