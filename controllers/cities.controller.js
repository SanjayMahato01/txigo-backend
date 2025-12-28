import City from "../models/cities.model.js";

// GET /api/cities
export const getAllCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cities", error });
  }
};

// PUT /api/cities/:id
export const updateCity = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  try {
    const updatedCity = await City.findByIdAndUpdate(
      id,
      { name, price },
      { new: true, runValidators: true }
    );

    if (!updatedCity) {
      return res.status(404).json({ message: "City not found" });
    }

    res.status(200).json(updatedCity);
  } catch (error) {
    res.status(500).json({ message: "Failed to update city", error });
  }
};
