import express from "express";
import { getAllInvoiceEmails } from "../controllers/invoiceEmail.controller.js";

const invoiceEmailRouter = express.Router();

// Routes
invoiceEmailRouter.get("/", getAllInvoiceEmails);


export default invoiceEmailRouter
