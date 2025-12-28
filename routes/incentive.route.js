
import express from "express";
import { createIncentive, getAllIncentives, getIncentivesByVendor } from "../controllers/incentive.controller.js";

const incentiveRouter = express.Router();

incentiveRouter.get("/getAllIncentive",getAllIncentives)
incentiveRouter.post("/createIncentive",createIncentive)
incentiveRouter.get("/getIncentiveByVendor/:vendorId",getIncentivesByVendor)

export default incentiveRouter;