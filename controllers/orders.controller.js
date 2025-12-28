import mongoose from "mongoose";
import Order from "../models/orders.model.js";
import Vendor from "../models/vendor.model.js";
import MyDriver from "../models/myDriver.model.js";
import { transporter } from "../utils/mailer.js";

export const createOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      pickup,
      drop,
      pickupDate,
      pickupTime,
      returnDate,
      ridefare,
      orderType,
      advancePayment,
      distance,
      nightAllowence,
      extraHr,
      extraKm,
      waitingCharge,
      pinCode,
      bookingStatus,
      carType,
      packages,
      advancePaymentConfirmation,
      dueAmount,
      luggage,
      carModel,
      petAllowance,
      refundable,
      chauffeurs,
      isAdmin
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !pickup || !pickupDate || !pickupTime || !ridefare || !orderType || !carType) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Generate a random 4-digit ride OTP
    const rideOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder = new Order({
      name,
      phone,
      email,
      pickup,
      drop,
      pickupDate,
      pickupTime,
      returnDate,
      ridefare,
      advancePayment,
      orderType,
      distance,
      nightAllowence,
      extraHr,
      extraKm,
      waitingCharge,
      pinCode,
      bookingStatus,
      carType,
      packages,
      dueAmount,
      advancePaymentConfirmation,
      luggage,
      carModel,
      petAllowance,
      refundable,
      chauffeurs,
      rideOtp,
      isAdmin
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder,
      rideOtp: rideOtp // You can optionally include it in the response
    });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate both 'vendor' and 'driver' with specific fields
    const order = await Order.findById(id)
      .populate({
        path: 'vendor',
        select: 'fullName BusinessName phone email BusinessAddress city state',
      })
      .populate("fleet")
      .populate("soloDriver")
      .populate({
        path: 'driver',
        select: 'driverName driverAddress driverMobileNo driverEmail alternativeName alternativePhone relationshipWithAlternative'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error while deleting order' });
  }
};

export const sendEmail = async (req, res) => {
  const { bookingId } = req.params;

  try {

    const order = await Order.findOne({ bookingId });


    if (!order) return res.status(404).json({ message: "Order not found" });

    const mailOptions = {
      from: `"Booking Confirmation" <${process.env.SMTP_USER}>`,
      to: order.email, // receiver from order
      subject: "Your Booking Confirmation",
      text: `Dear ${order.name},\n\nYour booking (ID: ${bookingId}) has been confirmed.\n\nThank you!`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
};


export const getOrdersByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Make sure we're querying by phone field, not _id
    const orders = await Order.find({ phone: phone }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this phone number' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders by phone:', error);
    res.status(500).json({
      message: 'Server error while fetching orders',
      error: error.message
    });
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { cancelReason } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    const pickupDateTime = new Date(`${order.pickupDate}T${order.pickupTime}`);
    const now = new Date();

    if (now > pickupDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed orders'
      });
    }

    // ✅ Update status and reason
    order.bookingStatus = 'cancelled';
    order.cancelReason = cancelReason;
    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        orderId: order._id,
        status: order.bookingStatus,
        cancelReason: order.cancelReason,
        cancelledAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getUnassignedOrders = async (req, res) => {
  const { vendorId } = req.params;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: "Missing vendorId",
    });
  }

  try {
    const currentDate = new Date();

    // Fetch orders where:
    // 1. vendor is not the logged-in vendor
    // 2. acknowledgement does not include the logged-in vendor
    const allOrders = await Order.find({
      $and: [
        { $or: [{ vendor: null }, { vendor: { $ne: vendorId } }] },
        { acknowledgement: { $ne: vendorId } },
        { bookingStatus: "booked" }
      ]
    });

    const filteredOrders = allOrders.filter(order => {
      if (!order.pickupDate || !order.pickupTime) return false;

      const datePart = new Date(order.pickupDate);
      const [hours, minutes] = order.pickupTime.split(":").map(Number);

      datePart.setHours(hours);
      datePart.setMinutes(minutes);
      datePart.setSeconds(0);
      datePart.setMilliseconds(0);

      return datePart > currentDate;
    });

    res.status(200).json({
      success: true,
      message: "Filtered unassigned orders fetched successfully",
      data: filteredOrders,
    });
  } catch (error) {
    console.error("Error fetching unassigned orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unassigned orders",
      error: error.message,
    });
  }
};


export const acceptOrder = async (req, res) => {
  const { orderId, vendorId } = req.body;

  if (!orderId || !vendorId) {
    return res.status(400).json({
      success: false,
      message: 'Missing orderId or vendorId',
    });
  }

  try {
    // Check vendor details first
    const vendor = await Vendor.findById(vendorId).populate('plan.planId');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    // Check if vendor is active
    if (vendor.status.current !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Vendor account is not active',
      });
    }

    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order is already accepted
    if (existingOrder.vendor) {
      // Add vendor to acknowledgement even if order is already accepted
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $addToSet: { acknowledgement: vendorId }
        },
        { new: true }
      );

      return res.status(409).json({
        success: false,
        message: 'Sorry, the order has already been accepted by another vendor.',
        data: updatedOrder,
        alreadyAccepted: true
      });
    }

    // Check if vendor has DIAMOND plan (don't deduct amount)
    const isDiamondPlan = vendor.plan.planId?.name === 'DIAMOND';

    let walletBalance = parseFloat(vendor.walletBalance || 0);
    const orderAmount = parseFloat(existingOrder.amount || 0);
    const riderFare = parseFloat(existingOrder.ridefare || 0);
    let currentEarnings = parseFloat(vendor.earnings || 0);

    if (!isDiamondPlan && walletBalance < orderAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance to accept this order',
      });
    }

    // Process order acceptance
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        vendor: vendorId,
        $addToSet: { acknowledgement: vendorId }
      },
      { new: true }
    );



    // Calculate new earnings (current earnings + rider fare)
    const platformCut = riderFare * 0.10;
    const vendorShare = riderFare - (isDiamondPlan ? 0 : platformCut)
    const newEarnings = currentEarnings + vendorShare;


    // Prepare update object for vendor
    const vendorUpdate = {
      earnings: newEarnings.toString()
    };

    // Update vendor wallet if not DIAMOND plan
    if (!isDiamondPlan) {

      walletBalance -= orderAmount;
      vendorUpdate.walletBalance = walletBalance.toString();
    }

    // Update vendor with earnings and optionally wallet balance
    await Vendor.findByIdAndUpdate(vendorId, vendorUpdate);

    res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: updatedOrder,
      walletDeducted: !isDiamondPlan,
      remainingBalance: isDiamondPlan ? vendor.walletBalance : walletBalance.toString(),
      earningsAdded: riderFare,
      totalEarnings: newEarnings.toString()
    });

  } catch (error) {
    console.error('Accept Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


export const getVendorOrders = async (req, res) => {
  const { vendorId } = req.params;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: "Missing vendorId in request",
    });
  }

  try {
    const orders = await Order.find({ vendor: vendorId })
      .populate("driver")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders for vendor fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor orders",
      error: error.message,
    });
  }
};

export const changeVendor = async (req, res) => {
  const { orderId } = req.params;
  const { vendorId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID or vendor ID format",
    });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    order.vendor = vendorId;
    await order.save();

    // Re-fetch to populate vendor details
    const updatedOrder = await Order.findById(orderId).populate("vendor");

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: {
        vendor: updatedOrder.vendor,
      },
    });
  } catch (err) {
    console.error("Error changing vendor:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const cancelOrderByVendor = async (req, res) => {
  const { orderId } = req.params;
  const { vendorId, vendorReason } = req.body;

  try {
    const order = await Order.findById(orderId);
    const vendor = await Vendor.findById(vendorId); // Fixed: "Vendor" should be capitalized (assuming it's a model)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    // Verify vendor ownership
    if (order.vendor?.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This order does not belong to the vendor',
      });
    }

    if (order.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    // Check if the pickup time has passed
    const pickupDateTime = new Date(`${order.pickupDate}T${order.pickupTime}`);
    const now = new Date();

    if (now > pickupDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed orders',
      });
    }

    // Cancel the order
    order.bookingStatus = 'cancelled';
    order.vendor = null;
    order.vendorReason = vendorReason || '';
    order.updatedAt = new Date();

    // 💎 DIAMOND Plan Bonus: Add 10% of ride fare to wallet
    const isDiamondPlan = Vendor.plan?.planId?.name === 'DIAMOND';
    
    if (!isDiamondPlan && order.ridefare) {
  
      const rewardAmount = Math.round(parseFloat(order.ridefare) * 0.10);
      vendor.walletBalance = -(vendor.walletBalance || 0) + rewardAmount;
      await vendor.save();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully by vendor',
      data: {
        orderId: order._id,
        status: order.bookingStatus,
        cancelledBy: order.cancelledBy,
        vendorReason: order.vendorReason,
        cancelledAt: order.updatedAt,
      },
    });

  } catch (error) {
    console.error('Vendor order cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getVendorActiveOrders = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('en-IN', { hour12: false });

    const orders = await Order.find({
      $and: [
        { vendor: vendorId },
        { bookingStatus: { $ne: 'cancelled' } },
        {
          $or: [
            { driver: { $exists: false } },
            { driver: null }
          ]
        },
        {
          $or: [
            { pickupDate: { $gt: currentDate } },
            {
              pickupDate: currentDate,
              pickupTime: { $gte: currentTime }
            }
          ]
        }
      ]
    }).populate('acknowledgement', 'name phone')
      .populate('vendor', 'name phone')
      .sort({ pickupDate: 1, pickupTime: 1 });

    res.json({
      success: true,
      data: orders,
      message: 'Active orders retrieved (excluding assigned orders)'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getActiveOrders = async (req, res) => {
  const { vendorId } = req.params;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: "Missing vendorId in request",
    });
  }

  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const orders = await Order.find({
      vendor: vendorId,
      driver: { $exists: true, $ne: null }, // Driver is assigned
      pickupDate: { $gte: currentDate } // Pickup date is today or in future
    }).populate('driver'); // This will include the full driver document

    // If you only need specific fields from the driver, you can do:
    // .populate('driver', 'name email phone') - just include the fields you need

    res.status(200).json({
      success: true,
      message: "Active vendor orders with drivers fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor orders",
      error: error.message,
    });
  }
};

export const removeVendorAndDriver = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // If driver assigned, clear assignedOrder from driver collection
    if (order.driver) {
      await MyDriver.findByIdAndUpdate(order.driver, {
        $unset: { assignedOrder: "" }
      });
    }

    // If vendor exists, push vendor to acknowledgement array
    if (order.vendor) {
      order.acknowledgement.push(order.vendor);
    }

    // Remove vendor & driver from order
    order.vendor = null;
    order.driver = null;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Vendor, Driver removed and Vendor ID added to acknowledgement",
      data: order,
    });

  } catch (error) {
    console.error("Error removing vendor and driver:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateOrderAcknowledgement = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body; // Expecting an array of vendor IDs to remove

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Remove the provided vendorIds from acknowledgement
    await Order.findByIdAndUpdate(id, {
      $pull: { acknowledgement: { $in: vendorIds } }
    });

    // Fetch the updated order
    const updatedOrder = await Order.findById(id)
      .populate('acknowledgement')
      .populate('vendor');

    res.status(200).json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order acknowledgement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOrderOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;

    if (!orderId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Order ID and OTP are required",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify OTP
    if (order.rideOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Get current date & time as string
    const currentDateTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    // Update ride status to "running" & set verifyOtpTime
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          rideStatus: "running",
          verifyOtpTime: currentDateTime
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. Ride started!",
      order: updatedOrder,
    });

  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: err.message,
    });
  }
};

export const getRunningTrips = async (req, res) => {
  try {
    const { vendorId } = req.query;

    // Check vendorId is provided
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "vendorId is required"
      });
    }

    // Validate if vendorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendorId format"
      });
    }

    // Convert to ObjectId
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    const runningTrips = await Order.find({
      vendor: vendorObjectId,
      rideStatus: "running"
    })
      .populate('vendor')
      .populate('driver');

    return res.status(200).json({
      success: true,
      data: runningTrips
    });
  } catch (error) {
    console.error("Error fetching running trips:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}

export const completeTheOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate if orderId is provided
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required"
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId format"
      });
    }


    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        rideStatus: "completed",
        rideEnd: new Date().toISOString() 
      },
      { new: true } 
    ).populate('vendor').populate('driver');
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order marked as completed",
      data: updatedOrder
    });

  } catch (error) {
    console.error("Error completing the order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}

export const getMissedBroadcasts = async (req, res) => {
  const { vendorId } = req.params;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: "Missing vendorId in request",
    });
  }

  try {
    const missedBroadcasts = await Order.find({
      vendor: vendorId,
      broadcastStatus: "missed"
    })
      .populate('driver') // Populate driver if needed
      .sort({ createdAt: -1 });  // Sort latest first

    res.status(200).json({
      success: true,
      message: "Latest missed broadcasts fetched successfully",
      data: missedBroadcasts,
    });
  } catch (error) {
    console.error("Error fetching missed broadcasts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch missed broadcasts",
      error: error.message,
    });
  }
};

export const getAllMissedBroadcasts = async (req, res) => {
  try {
    const missedBroadcasts = await Order.find({
      broadcastStatus: "missed"
    })
      .populate('vendor')
      .populate('driver')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All missed broadcasts fetched successfully",
      data: missedBroadcasts,
    });
  } catch (error) {
    console.error("Error fetching missed broadcasts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch missed broadcasts",
      error: error.message,
    });
  }
};

export const getOrdersByDriver = async (req, res) => {
  const { driver } = req.params;

  if (!driver) {
    return res.status(400).json({
      success: false,
      message: "Missing driver in request",
    });
  }

  try {
    const orders = await Order.find({ driver: driver })
      .populate("driver")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders for vendor fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor orders",
      error: error.message,
    });
  }
};

export const assignFleetToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { fleetId } = req.body;

    // Validate input
    if (!orderId || !fleetId) {
      return res.status(400).json({
        success: false,
        message: 'Both orderId and fleetId are required'
      });
    }

    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the fleet exists (optional validation)
    const fleet = await VendorCars.findById(fleetId);
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }

    // Update only the fleetId field
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { fleetId: fleetId }, // Only update fleetId
      { new: true } // Return the updated document
    );

    res.status(200).json({
      success: true,
      message: 'Fleet assigned successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error assigning fleet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign fleet',
      error: error.message
    });
  }
};

export const getUnassignedUpcomingOrders = async (req, res) => {
  try {
    const now = new Date();

    // Step 1: Fetch all unassigned orders
    const allOrders = await Order.find({
      driver: null,
      solorDriver : null,
      soloDriver: null
    })
      .sort({ createdAt: -1 });

    // Step 2: Filter orders where combined pickupDate + pickupTime is in the future
    const filteredOrders = allOrders.filter(order => {
      if (!order.pickupDate || !order.pickupTime) return false;

      const pickupDate = new Date(order.pickupDate);
      const [hours, minutes] = order.pickupTime.split(":").map(Number);

      if (isNaN(hours) || isNaN(minutes)) return false;

      pickupDate.setHours(hours, minutes, 0, 0);

      return pickupDate > now;
    });

    // Step 3: Return the filtered orders
    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error('Error fetching unassigned upcoming orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAdminsOrder = async (req, res) => {
  try {
    const allOrders = await Order.find().sort({ createdAt: -1 });
    const currentDate = new Date();

    const validOrders = allOrders.filter(order => {
      if (!order.pickupDate || !order.pickupTime) return false;

      // Create combined DateTime from pickupDate and pickupTime
      const pickupDateTime = new Date(order.pickupDate);
      const [hours, minutes] = order.pickupTime.split(':').map(Number);
      pickupDateTime.setHours(hours);
      pickupDateTime.setMinutes(minutes);
      pickupDateTime.setSeconds(0);
      pickupDateTime.setMilliseconds(0);

      const isFuture = pickupDateTime > currentDate;

      const isVendorEmpty = !order.vendor;
      const isDriverEmpty = !order.driver;
      const isSoloDriverEmpty = !order.soloDriver;

      // Admin case
      const adminCondition =  isFuture && isVendorEmpty && isDriverEmpty && isSoloDriverEmpty;

      // Cancelled case
      const cancelledCondition = order.bookingStatus === 'cancelled' && isFuture;

      return adminCondition || cancelledCondition;
    });

    res.status(200).json(validOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignSelectedDrivers = async (req, res) => {
  const { orderId } = req.params;
  const { selectedDriverIds } = req.body;

  if (!Array.isArray(selectedDriverIds) || selectedDriverIds.length === 0) {
    return res.status(400).json({ message: 'selectedDriverIds must be a non-empty array.' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          selectedDrivers: selectedDriverIds,
          bookingStatus: 'pending',
          driver: null,         
          soloDriver: null,
          isAdmin : true     
        }
      },
      { new: true }
    ).populate('selectedDrivers');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({
      message: 'Selected drivers assigned successfully, driver fields cleared, and status set to pending.',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error assigning selected drivers:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
export const unassignMultipleDrivers = async (req, res) => {
  const { orderId } = req.params;
  const { driverIds } = req.body;

  if (!Array.isArray(driverIds) || driverIds.length === 0) {
    return res.status(400).json({ message: 'driverIds must be a non-empty array.' });
  }

  try {
    // Find the order first to check current selectedDrivers
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Filter out the drivers to be unassigned
    const remainingDrivers = order.selectedDrivers.filter(
      driverId => !driverIds.includes(driverId.toString())
    );

    // Check if we're unassigning the soloDriver
    const wasSoloDriverUnassigned = driverIds.includes(order.soloDriver?.toString());

    const updateData = {
      selectedDrivers: remainingDrivers,
      ...(wasSoloDriverUnassigned && {
        soloDriver: null,
        driver: null
      })
    };

    // If no drivers left, set status to unassigned
    if (remainingDrivers.length === 0) {
      updateData.bookingStatus = 'unassigned';
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    ).populate('selectedDrivers');

    res.status(200).json({
      message: 'Selected drivers unassigned successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error unassigning selected drivers:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { bookingStatus } = req.body;

    if (!bookingStatus) {
      return res.status(400).json({ message: "bookingStatus is required" });
    }

    const updateData = { bookingStatus };

    // If booking is marked as "booked", set payment collection time
    if (bookingStatus.toLowerCase() === "booked") {
      updateData.paymentCollectionTime = new Date().toISOString();
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${bookingStatus}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error while updating order status" });
  }
};


