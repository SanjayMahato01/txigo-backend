import Blog from '../models/blog.model.js';

export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne(); 
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching blog', error: err.message });
  }
};


export const updateBlog = async (req, res) => {
  const { title, description } = req.body;

  try {
    const blog = await Blog.findOne();
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    blog.title = title || blog.title;
    blog.description = description || blog.description;

    const updatedBlog = await blog.save();

    res.status(200).json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: 'Error updating blog', error: err.message });
  }
};
