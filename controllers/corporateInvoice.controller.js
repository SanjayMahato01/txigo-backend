import CorporateInvoice from "../models/corporateInvoice.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { transporter } from "../utils/mailer.js";
import InvoiceEmail from "../models/invoiceEmail.model.js"
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CREATE corporate invoice
export const createCorporateInvoice = async (req, res) => {
  try {
    const { invoiceData } = req.body;
    const pdfFile = req.file;

    if (!invoiceData || !pdfFile) {
      if (pdfFile) fs.unlinkSync(pdfFile.path);
      return res
        .status(400)
        .json({ error: "Corporate invoice data and PDF are required" });
    }

    const parsedData = JSON.parse(invoiceData);

    const newInvoice = new CorporateInvoice({
      ...parsedData,
      pdfUrl: `/uploads/invoices/${pdfFile.filename}`,
    });

    await newInvoice.save();

    return res.status(201).json({
      message: "Corporate invoice saved successfully",
      data: newInvoice,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({
      error: "Failed to save corporate invoice",
      details: error.message,
    });
  }
};

// READ all corporate invoices
export const getCorporateInvoices = async (req, res) => {
  try {
    const invoices = await CorporateInvoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch corporate invoices" });
  }
};

// READ single corporate invoice
export const getCorporateInvoiceById = async (req, res) => {
  try {
    const invoice = await CorporateInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

// UPDATE corporate invoice
export const updateCorporateInvoice = async (req, res) => {
  try {
    const { invoiceData } = req.body;
    const invoice = await CorporateInvoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const updatedInvoice = await CorporateInvoice.findByIdAndUpdate(
      req.params.id,
      { ...invoiceData },
      { new: true }
    );

    res.json({
      message: "Corporate invoice updated",
      data: updatedInvoice,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update invoice",
      details: error.message,
    });
  }
};

// DELETE corporate invoice
export const deleteCorporateInvoice = async (req, res) => {
  try {
    const invoice = await CorporateInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const pdfFilename = invoice.pdfUrl?.split("/").pop();
    if (pdfFilename) {
      const pdfPath = path.join("uploads", "invoices", pdfFilename);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await CorporateInvoice.findByIdAndDelete(req.params.id);

    res.json({ message: "Corporate invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
};

// SEND corporate invoice email
export const sendCorporateInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId, to, subject, message, pdfUrl } = req.body;

    // 1. Find the invoice
    const invoice = await CorporateInvoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // 2. Build absolute file path
    const filename = pdfUrl.split("/").pop();
    const absolutePdfPath = path.join(
      __dirname,
      "..",
      "uploads",
      "invoices",
      filename
    );

    // 3. Check if PDF exists
    if (!fs.existsSync(absolutePdfPath)) {
      return res.status(400).json({ error: "PDF file not found" });
    }

    // 4. Send email
    const mailResponse = await transporter.sendMail({
      from: `"Corporate Invoice" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
      attachments: [
        {
          filename: `invoice_${invoice.invoiceNo}.pdf`,
          path: absolutePdfPath,
          contentType: "application/pdf",
        },
      ],
    });

    // 5. Save email history
    await InvoiceEmail.create({
      name: invoice.companyName,
      date: invoice.date,
      amount: invoice.totalPaid,
      pdfUrl: pdfUrl,
    });

    // 6. Send success response
    res.status(200).json({
      success: true,
      message: "Corporate invoice email sent successfully",
      messageId: mailResponse.messageId,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: error.message,
    });
  }
};
