import PromotionalEmail from '../models/promotionalEmail.model.js';
import { sendEmail } from '../utils/emailSender.js';

// Store the interval reference so we can clear it later if needed
let emailCheckInterval;

// Function to check and process pending emails
const checkAndProcessEmails = async () => {
  try {
    console.log('Checking for pending promotional emails...');
    
    // Find emails that were created more than 10 minutes ago and haven't been sent yet
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const pendingEmails = await PromotionalEmail.find({
      createdAt: { $lte: tenMinutesAgo },
      // You might want to add additional conditions here if needed
    });

    console.log(`Found ${pendingEmails.length} emails to process`);
    
    for (const email of pendingEmails) {
      await processSingleEmail(email);
    }
  } catch (error) {
    console.error('Error processing pending emails:', error.message);
  }
};

// Function to process and send a single promotional email
const processSingleEmail = async (email) => {
  try {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.email)) {
      console.log(`Invalid email format for ${email.email}, removing from database`);
      await PromotionalEmail.findByIdAndDelete(email._id);
      return;
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2d3748;">Hey ${email.name}, you have an unfinished booking!</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4a5568;">Booking Details:</h2>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Name:</strong> ${email.name}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> ${email.email}</li>
            <li style="margin-bottom: 8px;"><strong>Phone:</strong> ${email.phone}</li>
            <li style="margin-bottom: 8px;"><strong>Pickup:</strong> ${email.pickup}</li>
            <li style="margin-bottom: 8px;"><strong>Drop:</strong> ${email.drop}</li>
            <li style="margin-bottom: 8px;"><strong>Booking Type:</strong> ${email.bookingType}</li>
          </ul>
        </div>
        <p style="margin-top: 20px;">Click the button below to complete your booking:</p>
        <a href="https://www.txigo.com${email.redirectPath}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4299e1; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Complete Your Booking
        </a>
        <p style="margin-top: 20px; color: #718096;">If you didn't initiate this booking, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: email.email,
        subject: 'Complete Your Txigo Booking',
        html: emailContent
      });
      console.log(`Email sent to ${email.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${email.email}:`, error.message);
    } finally {
      // Always delete the record regardless of success or failure
      await PromotionalEmail.findByIdAndDelete(email._id);
      console.log(`Removed email record for ${email.email}`);
    }
  } catch (error) {
    console.error(`Error processing email for ${email.email}:`, error.message);
    // Make sure we delete even if there's an unexpected error
    try {
      await PromotionalEmail.findByIdAndDelete(email._id);
      console.log(`Force removed email record for ${email.email} after error`);
    } catch (dbError) {
      console.error(`Failed to remove email record for ${email.email}:`, dbError.message);
    }
  }
};

// Initialize the email checker when server starts
export const initializeEmailScheduler = async () => {
  try {
    // Clear any existing interval (in case of server restarts)
    if (emailCheckInterval) {
      clearInterval(emailCheckInterval);
    }
    
    // Start checking every 10 minutes (600,000 milliseconds)
    emailCheckInterval = setInterval(checkAndProcessEmails, 10 * 60 * 1000);
    
    // Also run an immediate check on startup
    await checkAndProcessEmails();
    
    console.log('Email scheduler initialized - checking every 10 minutes');
  } catch (error) {
    console.error('Error initializing email scheduler:', error.message);
  }
};

// Create function - simpler now since we don't need to schedule
export const createPromotionalEmail = async (req, res) => {
  const { name, email, phone, bookingType, pickup, drop, redirectPath } = req.body;
  
  if (!name || !email || !phone || !bookingType || !pickup  || !redirectPath) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
  

    const newEmail = new PromotionalEmail({
      name,
      email,
      phone,
      bookingType,
      pickup,
      drop,
      redirectPath
     
    });

    const savedEmail = await newEmail.save();
    res.status(201).json(savedEmail);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete function remains the same
export const deletePromotionalEmail = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID parameter is required" });
  }

  try {
    const deleted = await PromotionalEmail.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cleanup function to stop the scheduler if needed
export const stopEmailScheduler = () => {
  if (emailCheckInterval) {
    clearInterval(emailCheckInterval);
    console.log('Email scheduler stopped');
  }
};