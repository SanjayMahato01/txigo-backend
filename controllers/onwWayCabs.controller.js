import OneWayCabs from '../models/oneWayCabs.model.js';

export const addCity = async (req, res) => {

  try {

    const { zone, cityName, title, price, cityType } = req.body;
   
    if (!zone || !cityName || !title || !price || !cityType) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newCity = new OneWayCabs({
      zone,
      cityType,
      city: {
        cityName,
        title,
        price
      }
    });

    await newCity.save();
    res.status(201).json({ message: 'City added successfully', data: newCity });

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};


export const getCities = async (req, res) => {
  try {
    const cities = await OneWayCabs.find();
    res.status(200).json({ message: 'Cities fetched successfully', data: cities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cities', details: error.message });
  }
};
