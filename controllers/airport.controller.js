
import Airport from "../models/airport.model.js";


export const getAllAirports = async (req, res) => {
  try {
    const airports = await Airport.find();
    return res.status(200).json(airports);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching airports", error });
  }
};


