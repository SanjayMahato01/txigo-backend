import PageFaq from "../models/pageFaq.model.js";

// Create a new FAQ page
export const createPageFaq = async (req, res) => {
  try {
    const { pageName, url, content } = req.body;

    if (!pageName || !url) {
      return res.status(400).json({ error: "Page name and URL are required" });
    }

    const newPage = new PageFaq({ 
      pageName, 
      url, 
      content: Array.isArray(content) ? content : [] 
    });
    
    await newPage.save();

    res.status(201).json({ 
      message: "Page FAQ created successfully", 
      data: newPage 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all FAQ pages
export const getAllPageFaqs = async (req, res) => {
  try {
    const faqs = await PageFaq.find().sort({ createdAt: -1 });
    res.status(200).json(faqs.map(faq => ({
      ...faq.toObject(),
      content: Array.isArray(faq.content) ? faq.content : []
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single FAQ page by ID
export const getPageFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await PageFaq.findById(id);

    if (!page) {
      return res.status(404).json({ error: "Page FAQ not found" });
    }

    res.status(200).json({
      ...page.toObject(),
      content: Array.isArray(page.content) ? page.content : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPageFaqByUrlAndPageName = async (req, res) => {
  try {
    const { url, pageName } = req.params;

    if (!url || !pageName) {
      return res.status(400).json({ 
        success: false,
        error: "Missing parameters" 
      });
    }

    // Improved formatting function
    const formatForQuery = (str) => {
      return str
        .replace(/-/g, ' ')       // Replace hyphens with spaces
        .replace(/\s+/g, ' ')     // Collapse multiple spaces
        .trim()
        .toLowerCase();
    };

    // Get the raw formatted value for exact comparison
    const formattedUrl = formatForQuery(url);
    const formattedPageName = formatForQuery(pageName);

    // More flexible search - looks for containing the pattern
    const query = {
      pageName: { $regex: new RegExp(formattedPageName, 'i') },
      url: { $regex: new RegExp(formattedUrl, 'i') }
    };

   
    const result = await PageFaq.findOne(query).lean();

    if (!result) {
      // More detailed diagnostic
      const similarRecords = await PageFaq.find({
        pageName: { $regex: new RegExp(formattedPageName, 'i') }
      }).lean();
      

      
      return res.status(404).json({ 
        success: false,
        content: [],
        diagnostic: {
          input: { url, pageName },
          formatted: { url: formattedUrl, pageName: formattedPageName },
          similarRecords: similarRecords.map(r => r.url)
        }
      });
    }

    return res.json({ 
      success: true,
      content: result.content 
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
};
// Get a single FAQ page by URL
export const getPageFaqByUrl = async (req, res) => {
  try {
    const { url } = req.params;
    const page = await PageFaq.findOne({ url });

    if (!page) {
      return res.status(404).json({ error: "Page FAQ not found" });
    }

    res.status(200).json({
      ...page.toObject(),
      content: Array.isArray(page.content) ? page.content : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// In updatePageFaq controller, ensure you're returning the updated document
export const updatePageFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { pageName, url, content } = req.body;

    const updatedPage = await PageFaq.findByIdAndUpdate(
      id,
      {
        pageName,
        url,
        content: Array.isArray(content) ? content : []
      },
      { new: true, runValidators: true }
    );

    if (!updatedPage) {
      return res.status(404).json({ error: "Page FAQ not found" });
    }

    res.status(200).json({
      message: "Page FAQ updated successfully",
      data: updatedPage
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors // Mongoose validation errors if any
    });
  }
};
// Delete FAQ page by ID
export const deletePageFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPage = await PageFaq.findByIdAndDelete(id);

    if (!deletedPage) {
      return res.status(404).json({ error: "Page FAQ not found" });
    }

    res.status(200).json({ message: "Page FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};