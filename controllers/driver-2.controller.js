import Driver from '../models/driver.model.js';
import DriverBankDetails from '../models/driverBankDetails.model.js';
import DriverPlan from '../models/driverPlan.model.js';
import Order from '../models/orders.model.js';

export const addBankDetails = async (req, res) => {
  try {
    const {
      bankName,
      fullName,
      accountNumber,
      ifscCode,
      panNumber,
    } = req.body;

    // Basic validation
    if (!bankName || !fullName || !accountNumber || !ifscCode || !panNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Optional: check for existing accountNumber or panNumber
    const existing = await DriverBankDetails.findOne({ accountNumber });
    if (existing) {
      return res.status(409).json({ message: "Bank details already exist." });
    }

    const bankDetails = new DriverBankDetails({
      bankName,
      fullName,
      accountNumber,
      ifscCode,
      panNumber,
    });

    const savedDetails = await bankDetails.save();
    res.status(201).json({
      message: "Bank details added successfully.",
      data: savedDetails,
    });
  } catch (error) {
    console.error("Error adding bank details:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await DriverPlan.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Error fetching driver plans:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver plans',
      error: error.message,
    });
  }
};

export const setPilotType = async (req, res) => {
  const { driverId, planId } = req.body;

  if (!driverId || !planId) {
    return res.status(400).json({
      success: false,
      message: 'Driver ID and Plan ID are required',
    });
  }

  try {
    // Check if driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    // Check if plan exists
    const plan = await DriverPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    // Set pilotType
    driver.pilotType = planId;
    await driver.save();

    return res.status(200).json({
      success: true,
      message: 'Pilot type updated successfully',
      driver,
    });
  } catch (error) {
    console.error('Error setting pilot type:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const assignSoloDriverToOrder = async (req, res) => {
  const { orderId } = req.params;
  const { soloDriverId } = req.body;

  if (!soloDriverId) {
    return res.status(400).json({ message: "soloDriverId is required." });
  }

  try {
    // 1. Check if driver exists with populated pilotType
    const driver = await Driver.findById(soloDriverId).populate('pilotType');
    if (!driver) {
      return res.status(404).json({ message: "Solo driver not found." });
    }

    // 2. Find the order first
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // 3. Calculate deduction (if not primePlus)
    let shouldDeduct = driver.pilotType?.name !== "primePlus";

    if (shouldDeduct) {
      const fare = parseFloat(order.totalfare || 0);
      const deduction = Math.max(fare * 0.1, 100);
      const walletBalance = parseFloat(driver.walletBalance || "0");


      // Deduct from wallet
      driver.walletBalance = (walletBalance - deduction).toFixed(2);
      await driver.save();
    }

    // 4. Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          soloDriver: soloDriverId,
          bookingStatus: 'booked'
        }
      },
      { new: true }
    ).populate('soloDriver');

    res.status(200).json({
      message: `Solo driver assigned. Booking status updated to 'booked'.${shouldDeduct ? ' Wallet deducted.' : ' (primePlus - no deduction).'}`,
      order: updatedOrder
    });

  } catch (error) {
    console.error("Assign solo driver error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const getAllOrdersBySoloDriverId = async (req, res) => {
  const { driverId } = req.params;

  try {
    const orders = await Order.find({ soloDriver: driverId })
      .sort({ createdAt: -1 }) // latest first, optional
      .populate('soloDriver')
      .populate('')

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this driver." });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const updateDriverProfile2 = async (req, res) => {

  const { driverId } = req.params;
  const { address, state, pinCode } = req.body;

  // Validate fields
  if (!address || !state || !pinCode) {
    return res.status(400).json({
      success: false,
      message: "Address, state, and pin code are required.",
    });
  }

  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      {
        address,
        state,
        pinCode,
      },
      { new: true }
    );
    
    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver profile updated successfully.",
      driver: {
        _id: updatedDriver._id,
        name: updatedDriver.name,
        phone: updatedDriver.phone,
        email: updatedDriver.email,
        address: updatedDriver.address,
        state: updatedDriver.state,
        pinCode: updatedDriver.pinCode,
        createdAt: updatedDriver.createdAt,
      },
    });

  } catch (error) {
    console.error("Error updating driver profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating driver profile.",
      error: error.message,
    });
  }
};

export const getCompletedOrdersByDriverId = async (req, res) => {
  const { driverId } = req.params;

  try {
    // Find the driver and populate their completedOrders
    const driver = await Driver.findById(driverId)
      .populate({
        path: "completedOrders",
        match: { rideStatus: "completed" }, 
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: "soloDriver" },
          { path: "vendor" },
          { path: "fleet" }
        ]
      });

    if (!driver || !driver.completedOrders || driver.completedOrders.length === 0) {
      return res.status(404).json({ message: "No completed orders found for this driver." });
    }

    return res.status(200).json({ orders: driver.completedOrders });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const completeOrder = async (req, res) => {
  const { orderId, driverId } = req.body;

  if (!orderId || !driverId) {
    return res.status(400).json({ success: false, message: "Missing orderId or driverId" });
  }

  try {
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update rideStatus to "completed"
    order.rideStatus = "completed";
    await order.save();

    // Add completed order to driver
    await Driver.findByIdAndUpdate(driverId, {
      $addToSet: { completedOrders: order._id }
    });

    return res.status(200).json({ success: true, message: "Order completed successfully" });
  } catch (error) {
    console.error("Error completing order:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

