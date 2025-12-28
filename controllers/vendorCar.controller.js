import VendorCars from "../models/vendorCars.model.js";

export const getAllVendorCars = async (req, res) => {
  try {
    const cars = await VendorCars.find();

    res.status(200).json({
      success: true,
      message: "Vendor cars retrieved successfully",
      data: cars,
    });
  } catch (error) {
    console.error("Error fetching vendor cars:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor cars",
      error: error.message,
    });
  }
};


export const createVendorCar = async (req, res) => {
  try {
    const carData = req.body;

    const newCar = await VendorCars.create(carData);
  
    res.status(201).json({
      success: true,
      message: "Vendor car created successfully",
      data: newCar,
    });
  } catch (error) {
    console.error("Error creating vendor car:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create vendor car",
      error: error.message,
    });
  }
};

export const getVendorCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await VendorCars.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Vendor car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor car fetched successfully",
      data: car,
    });
  } catch (error) {
    console.error("Error fetching vendor car:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor car",
      error: error.message,
    });
  }
};

export const getVendorCarsByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const cars = await VendorCars.find({ vendor: vendorId }).populate("vendor"); // optional: .populate if you want full vendor details

    if (!cars || cars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cars found for this vendor",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor cars fetched successfully",
      data: cars,
    });
  } catch (error) {
    console.error("Error fetching vendor cars:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor cars",
      error: error.message,
    });
  }
};


export const updateVendorCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCar = await VendorCars.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCar) {
      return res.status(404).json({
        success: false,
        message: "Vendor car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor car updated successfully",
      data: updatedCar,
    });
  } catch (error) {
    console.error("Error updating vendor car:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update vendor car",
      error: error.message,
    });
  }
};

export const deleteVendorCar = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCar = await VendorCars.findByIdAndDelete(id);

    if (!deletedCar) {
      return res.status(404).json({
        success: false,
        message: "Vendor car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor car deleted successfully",
      data: deletedCar,
    });
  } catch (error) {
    console.error("Error deleting vendor car:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete vendor car",
      error: error.message,
    });
  }
};
