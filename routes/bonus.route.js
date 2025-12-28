
import express from "express";
import { createBonus, getAllBonus, getBounusByVendor } from "../controllers/bonus.controller.js";

const bonusRouter = express.Router();

bonusRouter.get("/getAllBonus",getAllBonus)
bonusRouter.post("/createBonus",createBonus)
bonusRouter.get("/getBonusByVendor/:vendorId",getBounusByVendor)

export default bonusRouter;