import BlogCategory from "../models/blogCategory.model.js";

// Create a new blog category
export const createBlogCategory = async (req, res, next) => {
  try {
    const { categoryName, pinNumber, metaData } = req.body;

    const newCategory = new BlogCategory({
      categoryName,
      pinNumber,
      metaData
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Pin number must be unique" });
    } else {
      next(error);
    }
  }
};

// Get all blog categories
export const getAllBlogCategories = async (req, res, next) => {
  try {
    const categories = await BlogCategory.find().sort({ createdAt: -1 });
  
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// Update a blog category by ID
export const updateBlogCategory = async (req, res, next) => {
  try {
    const { categoryName, pinNumber, metaData } = req.body;

    const updatedCategory = await BlogCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName, pinNumber, metaData },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Pin number must be unique" });
    } else {
      next(error);
    }
  }
};

// Delete a blog category by ID
export const deleteBlogCategory = async (req, res, next) => {
  try {
    const deleted = await BlogCategory.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};
