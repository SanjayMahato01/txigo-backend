import express from "express";
import {
  getAllDrivers,
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver,
  assignOrderToDriver,
  getDriversByVendor,
  getActiveDriversByVendor,
} from "../controllers/myDriver.controller.js";

const myDriverRouter = express.Router();

myDriverRouter.get("/getAll", getAllDrivers);               
myDriverRouter.post("/create", createDriver);             
myDriverRouter.get("/getOne/:id", getDriverById);           
myDriverRouter.put("/updateOne/:id", updateDriver);         
myDriverRouter.delete("/deleteOne/:id", deleteDriver);      
myDriverRouter.patch("/assignOrder/:driverId", assignOrderToDriver);      
myDriverRouter.get("/driverVendors/:vendorId", getDriversByVendor);      
myDriverRouter.get("/activeDriverVendors/:vendorId", getActiveDriversByVendor);      

export default myDriverRouter;
