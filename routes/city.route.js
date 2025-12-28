import express from "express";
import { getAllCities, updateCity } from "../controllers/cities.controller.js";

const cityRouter = express.Router();

cityRouter.get("/cities", getAllCities);
cityRouter.put("/cities/:id", updateCity);

export default cityRouter;
