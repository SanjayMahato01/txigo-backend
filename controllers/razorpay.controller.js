// controllers/razorpayController.js
import { razorpayInstance } from '../utils/razorpay.js';
import crypto from 'crypto';

export const createOrder = async (req, res) => {
  try {
    let { amount, currency = 'INR' } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Amount is required and must be a number' });
    }

    // Ensure amount is number and rounded up to avoid floating point issues
    amount = Math.ceil(Number(amount)); // rounds up, removes decimals
 
    if (amount > 5000000) {
      return res.status(400).json({ success: false, message: 'Amount exceeds Razorpay maximum limit (₹5,00,000)' });
    }

    const options = {
      amount, // ✅ Already in paise and rounded
      currency,
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ success: true, id: order.id }); // send just the ID
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: 'Razorpay order creation failed.' });
  }
};


export const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpay_signature) {
    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }
};
