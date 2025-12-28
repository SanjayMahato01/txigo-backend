import Contact from '../models/contact.model.js';


export const createContact = async (req, res) => {
    try {
        const { name, subject, email, message } = req.body;
        
        if (!name || !subject || !message || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newContact = new Contact({
            name,
            subject,
            email,
            message

        });

        const savedContact = await newContact.save();

        res.status(201).json(savedContact);
    } catch (error) {
        console.error("Create Contact Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }); // optional: sort newest first
        res.status(200).json(contacts);
    } catch (error) {
        console.error("Get All Contacts Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
