import mongoose from "mongoose";
import MyDriver from "../models/myDriver.model.js";
import Order from "../models/orders.model.js";

// GET all drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await MyDriver.find().populate("driverVendor");
    res.status(200).json({
      success: true,
      message: "Drivers retrieved successfully",
      data: drivers,
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
      error: error.message,
    });
  }
};

// CREATE a new driver
export const createDriver = async (req, res) => {
  try {
    const driverData = req.body;
    const newDriver = await MyDriver.create(driverData);

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: newDriver,
    });
  } catch (error) {
    console.error("Error creating driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create driver",
      error: error.message,
    });
  }
};

// GET a single driver by ID
export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await MyDriver.findById(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver fetched successfully",
      data: driver,
    });
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch driver",
      error: error.message,
    });
  }
};

// UPDATE a driver
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedDriver = await MyDriver.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update driver",
      error: error.message,
    });
  }
};

// DELETE a driver
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDriver = await MyDriver.findByIdAndDelete(id);

    if (!deletedDriver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
      data: deletedDriver,
    });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete driver",
      error: error.message,
    });
  }
};

export const assignOrderToDriver = async (req, res) => {
  
  try {
    const { driverId } = req.params;
    const { orderId,fleetId } = req.body;
  
    if (!driverId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Both driverId and orderId are required",
      });
    }

    // 1. Check if the order already has a driver assigned
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // If order has a different driver already assigned
    if (existingOrder.driver && existingOrder.driver.toString() !== driverId) {
      // Remove the order from the previously assigned driver
      await MyDriver.findByIdAndUpdate(
        existingOrder.driver,
        { $unset: { assignedOrder: "" } }
      );
    }

    // 2. Update the driver with the assigned order
    const updatedDriver = await MyDriver.findByIdAndUpdate(
      driverId,
      { $set: { assignedOrder: orderId } },
      { $set: { currentBooking: orderId } },
      { new: true, runValidators: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    // 3. Update the order with the assigned driver
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { driver: driverId,fleet:fleetId } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Order assigned to driver successfully",
      data: { driver: updatedDriver, order: updatedOrder },
    });
  } catch (error) {
    console.error("Error assigning order to driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign order to driver",
      error: error.message,
    });
  }
};

export const getDriversByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const drivers = await MyDriver.find({ driverVendor: vendorId });

    res.status(200).json({
      success: true,
      message: "Drivers retrieved successfully",
      data: drivers,
    });
  } catch (error) {
    console.error("Error fetching drivers by vendor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
      error: error.message,
    });
  }
};

export const getActiveDriversByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const drivers = await MyDriver.find({ driverVendor: vendorId });
    const driverIds = drivers.map(driver => driver._id);

    // Find all active orders (not completed) for these drivers
    const activeOrders = await Order.find({
      driver: { $in: driverIds },
      rideStatus: { $ne: "completed" }
    });

    // Get busy driver IDs
    const busyDriverIds = activeOrders.map(order => order.driver.toString());

    // Filter only available drivers
    const availableDrivers = drivers.filter(driver => !busyDriverIds.includes(driver._id.toString()));
   
    return res.status(200).json({
      success: true,
      data: availableDrivers
    });


  } catch (error) {
    console.error("Error fetching active drivers by vendor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active drivers",
      error: error.message,
    });
  }
};

