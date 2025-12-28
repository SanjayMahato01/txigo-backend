import express from "express";
import { 
  checkExistingDeleteCarRequest, 
  createDeleteCarRequest, 
  deleteDeleteCarRequest, 
  getAllArchiveRequests, 
  getAllDeleteCarRequests 
} from "../controllers/deleteCarRequest.controller.js";

const CarDeleteRequestRouter = express.Router();

CarDeleteRequestRouter.get("/getAll", getAllDeleteCarRequests);
CarDeleteRequestRouter.delete("/remove/:id", deleteDeleteCarRequest);
CarDeleteRequestRouter.post("/create", createDeleteCarRequest);
CarDeleteRequestRouter.get("/check", checkExistingDeleteCarRequest);
CarDeleteRequestRouter.get("/getArchiveCars", getAllArchiveRequests);

export default CarDeleteRequestRouter;