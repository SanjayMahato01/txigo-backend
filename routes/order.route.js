import express from "express";
import { acceptOrder, assignFleetToOrder, assignSelectedDrivers, cancelOrder, cancelOrderByVendor, changeVendor, completeTheOrder, createOrder, deleteOrder, getActiveOrders, getAllAdminsOrder, getAllMissedBroadcasts, getAllOrders, getMissedBroadcasts, getOrderById, getOrdersByDriver, getOrdersByPhone, getRunningTrips, getUnassignedOrders, getUnassignedUpcomingOrders, getVendorActiveOrders, getVendorOrders, removeVendorAndDriver, sendEmail, unassignMultipleDrivers, updateOrder, updateOrderAcknowledgement, updateOrderStatus, verifyOrderOtp } from "../controllers/orders.controller.js";

const orderRouter = express.Router();

orderRouter.post("/createOrder", createOrder)
orderRouter.get("/getAllOrders", getAllOrders)
orderRouter.get('/orders/:id', getOrderById);
orderRouter.put('/orders/:id', updateOrder);
orderRouter.delete('/orders/:id', deleteOrder);
orderRouter.get('/userOrders/:phone', getOrdersByPhone);
orderRouter.post('/sendBookingConfirmation/:bookingId', sendEmail);
orderRouter.patch('/order/cancel/:orderId', cancelOrder);
orderRouter.get('/unassignedOrders/:vendorId', getUnassignedOrders);
orderRouter.put('/accept', acceptOrder);
orderRouter.get('/fetchOrder/:vendorId', getVendorOrders);
orderRouter.patch('/change-vendor/:orderId', changeVendor);
orderRouter.patch('/cancel-vendor/:orderId', cancelOrderByVendor);
orderRouter.get('/vendor-orders/:vendorId', getVendorActiveOrders);
orderRouter.get('/active-orders/:vendorId', getActiveOrders);
orderRouter.patch('/removeVendorAndDriver/:orderId', removeVendorAndDriver);
orderRouter.patch('/update-acknowledgement/:id', updateOrderAcknowledgement);
orderRouter.post('/verifyRideOTP', verifyOrderOtp);
orderRouter.get('/getRunningTrips', getRunningTrips);
orderRouter.patch('/completeOrder/:orderId', completeTheOrder);
orderRouter.get('/missedBrodCastStatus/:vendorId', getMissedBroadcasts);
orderRouter.get('/getAllMissedBordcast', getAllMissedBroadcasts);
orderRouter.get('/getOrdersByDriver/:driver', getOrdersByDriver);
orderRouter.put('/assignFleet/:orderId', assignFleetToOrder);
orderRouter.get('/getOrdersUnassigned', getUnassignedUpcomingOrders);
orderRouter.get('/getAllAdminOrder', getAllAdminsOrder);
orderRouter.put('/assignSelectedDriver/:orderId', assignSelectedDrivers);
orderRouter.put('/unassign-multiple-drivers/:orderId', unassignMultipleDrivers);
orderRouter.patch('/updateStatus/:orderId', updateOrderStatus);

export default orderRouter;