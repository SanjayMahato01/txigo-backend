// routes/razorpayRoutes.js
import express from 'express';
import { createOrder, verifyPayment } from '../controllers/razorpay.controller.js';

const RazorPayRouter = express.Router();

RazorPayRouter.post('/create-order', createOrder);
RazorPayRouter.post('/verify', verifyPayment);

export default RazorPayRouter;
