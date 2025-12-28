import History from '../models/history.model.js';

export const createHistory = async (req, res) => {
    try {
        const { HistoryType, description } = req.body;

        // Validation (you can expand this as needed)
        if (!HistoryType || !description) {
            return res.status(400).json({ success: false, message: 'HistoryType and description are required.' });
        }

        // Create the history record
        const newHistory = await History.create({ HistoryType, description });

        return res.status(201).json({
            success: true,
            message: 'History record created successfully.',
            data: newHistory
        });
    } catch (error) {
        console.error('Error creating history record:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getHistoryByType = async (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ success: false, message: 'History type is required in query.' });
        }

        const histories = await History.find({ HistoryType: type }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: `History records for type: ${type}`,
            data: histories
        });
    } catch (error) {
        console.error('Error fetching history records:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};