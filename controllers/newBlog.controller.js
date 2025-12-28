import NewBlog from "../models/newBlog.model.js";
import { getFileUrl } from "../middleware/uploadMiddleware.js";
import fs from "fs"
import mongoose from "mongoose";


// Create blog with images
export const createBlog = async (req, res, next) => {
  try {
    const {
      category,
      urlEndpoint,
      orderNumber,
      blogTitle,
      categoryOrderNumber,
      author,
      metaData,
      visiblity = true,
      tags 
    } = req.body;
     
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Parse blogItems
    const blogItemsRaw = req.body.blogItems || "[]";

    let blogItems = [];
    try {
      blogItems = JSON.parse(blogItemsRaw);
    } catch (err) {
      return res.status(400).json({ message: "Invalid blogItems format" });
    }

    // Process images (assuming you use blogImages as fieldName)
    const processedBlogItems = blogItems.map((item, index) => {
      const file = req.files?.[index];
      return {
        heading: item.heading,
        image: {
          url: file ? getFileUrl(req, file.filename, "blog-images") : "",
          height: item.image?.height || "",
          altTag: item.image?.altTag || ""
        }
      };
    });

    const blog = new NewBlog({
      category,
      urlEndpoint,
      orderNumber,
      blogTitle,
      categoryOrderNumber,
      visiblity,
      author,
      metaData,
      blogItems: processedBlogItems,
      tags
    });

    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
};


// Get all blogs with pagination
export const getAllBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await NewBlog.find()
      .populate("category") 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // lean for better performance

    const total = await NewBlog.countDocuments();
  
    res.status(200).json({
      data: blogs,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single blog
export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate the ID format first
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: "Invalid blog ID format",
        error: `The ID '${id}' is not a valid MongoDB ObjectId`
      });
    }

    const blog = await NewBlog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate("category", "name")
    .populate("author", "username")
    .lean();

    if (!blog) {
      return res.status(404).json({ 
        message: "Blog not found",
        error: `No blog found with ID '${id}'`
      });
    }

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const getBlogByUrlEndpoint = async (req, res, next) => {
  try {
    const { urlEndpoint } = req.params;
    
    // Validate the urlEndpoint exists
    if (!urlEndpoint) {
      return res.status(400).json({ 
        success: false,
        message: "URL endpoint is required",
        error: "No URL endpoint provided in request"
      });
    }

    const blog = await NewBlog.findOneAndUpdate(
      { urlEndpoint },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found",
        error: `No blog found with URL endpoint '${urlEndpoint}'`
      });
    }


    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};
// Like a blog
export const likeBlog = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const blogId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const blog = await NewBlog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const alreadyLiked = blog.likedBy.includes(userId);
    let updatedBlog;

    if (alreadyLiked) {
      // Unlike the blog
      updatedBlog = await NewBlog.findByIdAndUpdate(
        blogId,
        { 
          $pull: { likedBy: userId },
          $inc: { likes: -1 }
        },
        { new: true }
      );
    } else {
      // Like the blog
      updatedBlog = await NewBlog.findByIdAndUpdate(
        blogId,
        { 
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 }
        },
        { new: true }
      );
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

// Update blog
export const updateBlog = async (req, res, next) => {
  try {
    const {
      category,
      urlEndpoint,
      orderNumber,
      categoryOrderNumber,
      visiblity,
      author,
      metaData,
      blogItems = [],
      tags
    } = req.body;

    // Parse blogItems
    const parsedBlogItems = typeof blogItems === 'string' 
      ? JSON.parse(blogItems) 
      : blogItems;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    // Get all uploaded files
    const uploadedFiles = req.files || [];
    let fileIndex = 0;

    // Process blog items
    const processedBlogItems = parsedBlogItems.map(item => {
      const newItem = {
        heading: item.heading,
        image: {
          height: item.image?.height || '',
          altTag: item.image?.altTag || '',
          // Preserve existing URL unless we have a new image
          url: item.image?.url || '' 
        }
      };

      // Check if this item has a new image
      if (item._hasNewImage && uploadedFiles[fileIndex]) {
        newItem.image.url = getFileUrl(req, uploadedFiles[fileIndex].filename, "blog-images");
        fileIndex++;
      }

      return newItem;
    });

    const updateData = {
      category,
      urlEndpoint,
      orderNumber,
      categoryOrderNumber,
      visiblity,
      author,
      metaData,
      blogItems: processedBlogItems,
      tags
    };

    const updatedBlog = await NewBlog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

// Delete blog
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await NewBlog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete associated images
    if (blog.images && blog.images.length > 0) {
      blog.images.forEach(image => {
        fs.unlink(image.path, err => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// get blog by tag
export const getBlogsByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    
    if (!tag) {
      return res.status(400).json({
        success: false,
        message: "Tag parameter is required"
      });
    }

    // Find all blogs that might contain the tag
    const blogs = await NewBlog.find({})
      .populate("category", "categoryName")
      .lean();

    // Filter blogs that actually contain the tag after parsing
    const filteredBlogs = blogs.filter(blog => {
      try {
        // Parse the stringified tags array
        const parsedTags = JSON.parse(blog.tags[0].replace(/'/g, '"'));
        return parsedTags.some(t => t.toLowerCase() === tag.toLowerCase());
      } catch (e) {
        return false;
      }
    });

    if (!filteredBlogs.length) {
      return res.status(404).json({
        success: false,
        message: `No blogs found with tag '${tag}'`
      });
    }

    res.status(200).json({
      success: true,
      data: filteredBlogs
    });

  } catch (error) {
    next(error);
  }
};

// Like/unlike blog
export const toggleLike = async (req, res, next) => {
  try {
    const blog = await NewBlog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }, // Just increment likes by 1
      { new: true } // Return the updated document
    );

    if (!blog) {
    
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const getBlogsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    const blogs = await NewBlog.find({ category: categoryId })
      .populate("category", "categoryName _id")
      .sort({ createdAt: -1 })
      .lean();

    if (!blogs.length) {
      return res.status(404).json({
        success: false,
        message: `No blogs found for this category`
      });
    }

    res.status(200).json({
      success: true,
      data: blogs
    });

  } catch (error) {
    next(error);
  }
};