import express from "express";
import { createEarningHistory, getEarningHistoryByVendorAndType } from "../controllers/earningHistory.controller.js";

const earningHistory = express.Router();

earningHistory.get('/earning-history/:vendorId/:historyType', getEarningHistoryByVendorAndType);
earningHistory.post('/create', createEarningHistory);


export default earningHistory;