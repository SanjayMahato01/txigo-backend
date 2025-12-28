import Newsletter from '../models/newsletter.model.js'; // adjust the path if needed
import { transporter } from '../utils/mailer.js';  // Adjust path if in another file

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    // Send thank-you email
    // await transporter.sendMail({
    //   from: `"TXIGO" `,
    //   to: email,
    //   subject: 'Thanks for subscribing to our newsletter!',
    //   html: `
    //     <h2>Thank you for subscribing!</h2>
    //     <p>You will now receive the latest updates and news directly to your inbox.</p>
    //     <p>- The Team</p>
    //   `,
    // });

    return res.status(201).json({ message: 'Subscribed and email sent successfully' });
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};



export const getAllNewsletter = async (req, res) => {
  try {
    const newsletters = await Newsletter.find().select('-__v -_id'); // hide _id and __v
    res.status(200).json(newsletters);
  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
