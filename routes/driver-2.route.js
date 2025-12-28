import express from 'express';
import { addBankDetails, assignSoloDriverToOrder, completeOrder, getAllOrdersBySoloDriverId, getAllPlans, getCompletedOrdersByDriverId,  setPilotType, updateDriverProfile2 } from '../controllers/driver-2.controller.js';

const Driver2Router = express.Router();

Driver2Router.post('/addBank', addBankDetails);
Driver2Router.get("/getAllDriverPlans",getAllPlans)
Driver2Router.put("/setPilotType",setPilotType)
Driver2Router.put("/assignSoloDriver/:orderId",assignSoloDriverToOrder)
Driver2Router.get("/getAllOrdersBySoloDriverId/:driverId",getAllOrdersBySoloDriverId)
Driver2Router.patch("/updateDriver/:driverId",updateDriverProfile2)
Driver2Router.get("/getDriverCompletedOrder/:driverId",getCompletedOrdersByDriverId)
Driver2Router.post("/complete", completeOrder);

export default Driver2Router;