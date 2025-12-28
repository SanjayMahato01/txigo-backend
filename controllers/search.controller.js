import Search from '../models/mostSearch.model.js'; 

export const createSearch = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      bookingType,
      pickup,
      drop,
      pickupDate,
      pickupTime,
      returnDate,
      package: travelPackage,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !bookingType || !pickup || !pickupDate || !pickupTime) {
      return res.status(400).json({
        message: "name, email, phone, bookingType, pickup, and pickupDate are required.",
      });
    }

    const newSearch = new Search({
      name,
      email,
      phone,
      bookingType,
      pickup,
      drop,
      pickupDate,
      returnDate,
      pickupTime,
      package: travelPackage,
    });

    const savedSearch = await newSearch.save();
    res.status(201).json(savedSearch);
  } catch (error) {
    res.status(500).json({ message: "Failed to create search", error: error.message });
  }
};


export const getAllSearches = async (req, res) => {
  try {
    const searches = await Search.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(searches);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch searches", error: error.message });
  }
};
