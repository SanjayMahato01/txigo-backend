import express from "express";
import { getAllAirports } from "../controllers/airport.controller.js";

const airportRouter = express.Router();

airportRouter.get("/getAirports", getAllAirports)

export default airportRouter;