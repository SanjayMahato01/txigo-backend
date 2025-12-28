import express from "express";
import { getPaymentHistoryByVendorAndType } from "../controllers/paymentHistory.controller.js";

const paymentHistory = express.Router();

paymentHistory.get('/payment-history/:vendorId/:historyType', getPaymentHistoryByVendorAndType);


export default paymentHistory;