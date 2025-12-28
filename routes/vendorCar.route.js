
import express from "express";
import { createVendorCar, deleteVendorCar, getAllVendorCars, getVendorCarById, getVendorCarsByVendorId, updateVendorCar } from "../controllers/vendorCar.controller.js";


const vendorCarRouter = express.Router();

vendorCarRouter.get('/getAll', getAllVendorCars)
vendorCarRouter.post('/create', createVendorCar)
vendorCarRouter.get('/getOne/:id', getVendorCarById)
vendorCarRouter.get('/getVendorCars/:vendorId', getVendorCarsByVendorId)
vendorCarRouter.put('/updateOne/:id', updateVendorCar)
vendorCarRouter.delete("/vendor-car/:id", deleteVendorCar);


export default vendorCarRouter;