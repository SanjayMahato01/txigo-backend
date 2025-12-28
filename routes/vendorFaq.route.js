import express from "express";
import { addFaq, updateFaq, deleteFaq, getAllFaq } from "../controllers/vendorFaq.controller.js"

const VendorFaqRouter = express.Router();

VendorFaqRouter.get("/getAll", getAllFaq);               // Create
VendorFaqRouter.post("/addFaq", addFaq);               // Create
VendorFaqRouter.put("/updateFaq/:id", updateFaq);          // Update
VendorFaqRouter.delete("/deleteFaq/:id", deleteFaq);       // Delete

export default VendorFaqRouter;
