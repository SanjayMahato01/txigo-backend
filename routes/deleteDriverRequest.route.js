import express from "express";
import { checkExistingDeleteRequest, createDeleteRequest, deleteDeleteRequest, getAllArchiveRequests, getAllDeleteRequests } from "../controllers/driverDeleteRequest.controller.js";

const DriverDeleteRequestRouter = express.Router();

DriverDeleteRequestRouter.get("/getAll", getAllDeleteRequests);
DriverDeleteRequestRouter.delete("/remove/:id", deleteDeleteRequest);
DriverDeleteRequestRouter.post("/create", createDeleteRequest);
DriverDeleteRequestRouter.get("/check", checkExistingDeleteRequest);
DriverDeleteRequestRouter.get("/getArchiveDrivers", getAllArchiveRequests);

export default DriverDeleteRequestRouter;
