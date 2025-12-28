import DriverContent from "../models/driverContent.model.js";

// 1. Create new driver content
export const createDriverContent = async (req, res) => {
  try {
    const { cityName, content } = req.body;

    if (!cityName || !Array.isArray(content)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const newEntry = new DriverContent({ cityName, content });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to create driver content" });
  }
};

// 2. Get all driver contents
export const getAllDriverContents = async (req, res) => {
  try {
    const contents = await DriverContent.find().sort({ createdAt: -1 });
    res.status(200).json(contents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch driver contents" });
  }
};

// 3. Get driver content by ID
export const getDriverContentById = async (req, res) => {
  try {
    const content = await DriverContent.findById(req.params.id);
    if (!content) return res.status(404).json({ error: "Not found" });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch driver content" });
  }
};

// 4. Update driver content by ID
export const updateDriverContent = async (req, res) => {
  try {
    const updated = await DriverContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update driver content" });
  }
};

// 5. Delete driver content by ID
export const deleteDriverContent = async (req, res) => {
  try {
    const deleted = await DriverContent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete driver content" });
  }
};

// 6. Get content by city name
export const getDriverContentByCity = async (req, res) => {
  try {
    const content = await DriverContent.findOne({ cityName: req.params.city });
    if (!content) return res.status(404).json({ error: "City not found" });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch city content" });
  }
};


