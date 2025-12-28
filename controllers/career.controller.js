
import { transporter } from '../utils/mailer.js'
import CareerApplication from '../models/career.model.js'

export const applyForJob = async (req, res) => {
  try {
    const { name, email, phone, jobId, jobTitle } = req.body
    const resume = req.file

    if (!resume) {
      return res.status(400).json({ error: 'Resume file is required' })
    }

    // Save application data to MongoDB
    const application = new CareerApplication({
      name,
      email,
      phone,
      jobId,
      jobTitle,
    })
    await application.save()

    // Send email with resume
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Job Application: ${jobTitle}`,
      text: `
New job application received:

Name: ${name}
Email: ${email}
Phone: ${phone}
Job ID: ${jobId}
Position: ${jobTitle}
      `,
      attachments: [
        {
          filename: resume.originalname,
          content: resume.buffer,
        }
      ]
    }

    await transporter.sendMail(mailOptions)

    res.status(200).json({ message: 'Application submitted successfully!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to submit application' })
  }
}

export const getAllCareers = async (req, res) => {
  try {
    const applications = await CareerApplication.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching career applications:', error);
    res.status(500).json({ error: 'Server error fetching applications' });
  }
};
