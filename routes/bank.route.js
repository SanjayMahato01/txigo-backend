import express from "express";
import { addBankDetails, getBankDetails, updateBankDetails } from "../controllers/bank.controller.js";

const bankRouter = express.Router();

bankRouter.post("/bank", addBankDetails);
bankRouter.get("/bank/:vendorId", getBankDetails);
bankRouter.put("/bank/:vendorId", updateBankDetails);

export default bankRouter;
