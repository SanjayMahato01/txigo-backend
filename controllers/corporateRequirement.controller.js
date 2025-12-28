import Corporate from '../models/corporateRequirements.model.js';


export const createCorporate = async (req, res) => {
    try {
        const { name, company, email, contact, business_volumes } = req.body;

        if (!name || !company || !email || !contact || !business_volumes) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newCorporate = new Corporate({
            name,
            company,
            email,
            contact,
            business_volumes
        });

        const savedCorporate = await newCorporate.save();

        res.status(201).json(savedCorporate);
    } catch (error) {
        console.error("Create Corporate Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getAllCorporates = async (req, res) => {
    try {
        const corporates = await Corporate.find().sort({ createdAt: -1 }); 
        res.status(200).json(corporates);
    } catch (error) {
        console.error("Get All Corporates Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
