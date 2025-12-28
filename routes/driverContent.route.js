import express from "express";
import {
  createDriverContent,
  getAllDriverContents,
  getDriverContentById,
  updateDriverContent,
  deleteDriverContent,
  getDriverContentByCity,
} from "../controllers/driverContent.controller.js";

const driverContentRouter = express.Router();

driverContentRouter.post("/", createDriverContent);
driverContentRouter.get("/", getAllDriverContents);
driverContentRouter.get("/:id", getDriverContentById);
driverContentRouter.put("/:id", updateDriverContent);
driverContentRouter.delete("/:id", deleteDriverContent);
driverContentRouter.get("/city/:city", getDriverContentByCity);

export default driverContentRouter;
