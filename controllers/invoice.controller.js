import Invoice from "../models/invoice.model.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {transporter} from "../utils/mailer.js";
import InvoiceEmail from "../models/invoiceEmail.model.js"
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CREATE invoice (now accepts HTML content and generates PDF)
export const createInvoice = async (req, res) => {
  try {

    const { invoiceData } = req.body;
    const pdfFile = req.file;

    if (!invoiceData || !pdfFile) {
      if (pdfFile) fs.unlinkSync(pdfFile.path);
      return res.status(400).json({ error: "Invoice data and PDF are required" });
    }

    const parsedInvoiceData = JSON.parse(invoiceData);

    const newInvoice = new Invoice({
      ...parsedInvoiceData,
      pdfUrl: `/uploads/invoices/${pdfFile.filename}`,
    });

    await newInvoice.save();

    return res.status(201).json({
      message: "Invoice saved successfully",
      data: newInvoice,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({
      error: "Failed to save invoice",
      details: error.message,
    });
  }
};


// READ all invoices (unchanged)
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

// READ single invoice (unchanged)
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

// UPDATE invoice (modified to handle HTML updates)
export const updateInvoice = async (req, res) => {
  try {
    const { invoiceData, htmlContent } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Update HTML file if content changed
    if (htmlContent && invoice.htmlPath) {
      fs.writeFileSync(invoice.htmlPath, htmlContent);
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...invoiceData },
      { new: true }
    );

    res.json({ 
      message: "Invoice updated", 
      data: updatedInvoice 
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to update invoice", 
      details: error.message 
    });
  }
};

// DELETE invoice (unchanged)

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    // Extract the filename from pdfUrl
    const pdfFilename = invoice.pdfUrl?.split('/').pop(); // "b36f890e-30e4-4e2e-b09b-ca3c3b254e59.pdf"

    if (pdfFilename) {
      const pdfPath = path.join('uploads', 'invoices', pdfFilename);

      // Delete the file if it exists
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Delete the invoice record from the database
    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
};

export const sendInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId, to, subject, message, pdfUrl } = req.body;

    // 1. Find invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // 2. Get absolute path of the PDF
    const filename = pdfUrl.split('/').pop();
    const absolutePdfPath = path.join(__dirname, '..', 'uploads', 'invoices', filename);

    if (!fs.existsSync(absolutePdfPath)) {
      console.error(`PDF not found at: ${absolutePdfPath}`);
      return res.status(400).json({ error: "PDF file not found" });
    }

    // 3. Send the email
    const mailResponse = await transporter.sendMail({
      from: `"Invoice Service" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
      attachments: [{
        filename: `invoice_${invoice.invoiceNo}.pdf`,
        path: absolutePdfPath,
        contentType: 'application/pdf'
      }]
    });

    // 4. Save email history
    await InvoiceEmail.create({
      name: invoice.customerName,
      date: invoice.date,
      amount: invoice.totalPaid,
      pdfUrl: pdfUrl,
    });

    // 5. Respond
    res.status(200).json({ 
      success: true,
      message: "Email sent successfully",
      messageId: mailResponse.messageId 
    });

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send email",
      details: error.message 
    });
  }
};