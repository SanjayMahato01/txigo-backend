

import TripExecuted from "../models/tripExcuted.model.js";  // import your model (adjust path if needed)

export const addTripExecuted = async (req, res) => {
    try {
        const {
            bookingId,
            amount,
            carType,
            startDate,
            endDate,
            status,
            cashCollected,
            vendorCost,
            finalAmount,
            driver,
            vendor,
            startTime,
            endTime
        } = req.body;

        // Basic validation (optional but good practice)
        if (
            !bookingId || !amount || !carType || !startDate || !endDate ||
            !cashCollected || !finalAmount || !driver || !vendor
        ) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        const newTrip = new TripExecuted({
            bookingId,
            amount,
            carType,
            startDate,
            endDate,
            status, 
            cashCollected,
            vendorCost,  
            finalAmount,
            driver,
            vendor,
            startTime,
            endTime
        });

        await newTrip.save();

        res.status(201).json({ message: "Trip executed record added successfully", data: newTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong while adding trip executed" });
    }
};

export const getCompletedTripsByVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { startDate, endDate, bookingId, carType } = req.query;

     
        // Validate required parameters
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                success: false,
                message: 'Both startDate and endDate query parameters are required'
            });
        }

        // Convert incoming dates into string format matching DB ("12 Jun 2025")
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }).replace(/ /g, ' ');
        };

        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);

        // Build base query
        const query = {
            vendor: vendorId,
            endDate: { $gte: startStr, $lte: endStr },
            status: { $ne: 'cancelled' }
        };

        // Optional filters
        if (bookingId) {
            query.bookingId = bookingId;
        }
        if (carType) {
            query.carType = carType;
        }

        // Query database
        const trips = await TripExecuted.find(query)
            .populate('driver', 'driverName driverMobileNo')
            .populate('vendor', 'name phone')
            .sort({ endDate: 1 });

       

        res.status(200).json({
            success: true,
            count: trips.length,
            data: trips
        });

    } catch (error) {
        console.error('Error fetching completed trips:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching trips',
            error: error.message
        });
    }
};


export const getAllTripExecuted = async (req, res) => {
    try {
        const trips = await TripExecuted.find()
            .populate('driver')   
            .populate('vendor')   
            .sort({ createdAt: -1 });  
   
        res.status(200).json({
            success: true,
            data: trips
        });
    } catch (error) {
        console.error("Error fetching TripExecuted data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch TripExecuted data",
            error: error.message
        });
    }
};