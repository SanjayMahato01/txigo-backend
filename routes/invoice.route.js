import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  sendInvoiceEmail,
} from "../controllers/invoice.controller.js";

import { invoiceUploadMiddleware } from "../middleware/invoiceUpload.js";

const invoiceRouter = express.Router();

// Routes

invoiceRouter.post("/", invoiceUploadMiddleware, createInvoice);
invoiceRouter.get("/", getInvoices);
invoiceRouter.get("/:id", getInvoiceById);
invoiceRouter.put("/:id",invoiceUploadMiddleware, updateInvoice);
invoiceRouter.delete("/:id", deleteInvoice);
invoiceRouter.post('/send-email', sendInvoiceEmail);

export default invoiceRouter;
