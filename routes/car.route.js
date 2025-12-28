import express from "express";
import { getCars } from "../controllers/cars.controller.js";

const carRouter = express.Router();

carRouter.get("/get-cars", getCars)

export default carRouter;