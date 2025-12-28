import Cars from "../models/cars.model.js"


export const getCars = async (req, res) => {
  try {
    const cars = await Cars.find(); 
    res.status(200).json(cars); 
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cars', error });
  }
};


