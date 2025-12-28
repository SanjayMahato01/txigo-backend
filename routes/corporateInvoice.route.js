import express from "express";
import {
  createCorporateInvoice,
  getCorporateInvoices,
  getCorporateInvoiceById,
  updateCorporateInvoice,
  deleteCorporateInvoice,
  sendCorporateInvoiceEmail,
} from "../controllers/corporateInvoice.controller.js";

import { invoiceUploadMiddleware } from "../middleware/invoiceUpload.js";

const corporateInvoiceRouter = express.Router();

// Routes
corporateInvoiceRouter.post("/", invoiceUploadMiddleware, createCorporateInvoice);
corporateInvoiceRouter.get("/", getCorporateInvoices);
corporateInvoiceRouter.get("/:id", getCorporateInvoiceById);
corporateInvoiceRouter.put("/:id", invoiceUploadMiddleware, updateCorporateInvoice);
corporateInvoiceRouter.delete("/:id", deleteCorporateInvoice);
corporateInvoiceRouter.post("/send-email", sendCorporateInvoiceEmail);

export default corporateInvoiceRouter;
