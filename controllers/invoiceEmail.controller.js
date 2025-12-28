
import InvoiceEmail from '../models/invoiceEmail.model.js'; 

export const getAllInvoiceEmails = async (req, res) => {
  try {
    const invoices = await InvoiceEmail.find().sort({ createdAt: -1 }); // optional: latest first
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error while fetching invoice emails' });
  }
};
