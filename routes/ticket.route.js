import express from "express";
import { 
  createTicket, 
  getAllTickets, 
  getVendorTickets,
  addMessageToTicket,
  resolveTicket
} from "../controllers/vendorTicket.controller.js";

const ticketRouter = express.Router();

ticketRouter.get("/getAllTicket", getAllTickets);
ticketRouter.post("/addTicket", createTicket);
ticketRouter.get("/getVendorTickets/:vendorId", getVendorTickets);
ticketRouter.post("/:ticketId/message", addMessageToTicket);
ticketRouter.put("/:ticketId/resolve", resolveTicket);

export default ticketRouter;