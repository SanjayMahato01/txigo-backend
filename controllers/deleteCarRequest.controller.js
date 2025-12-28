import CarArchive from "../models/carArchive.js";
import CarDeleteRequest from "../models/deleteCarRequest.model.js";  // adjust path based on your structure
import VendorCar from "../models/vendorCars.model.js";

// 1. Create Delete Request Controller
export const createDeleteCarRequest = async (req, res) => {
    try {
        const { car, reason, vendor } = req.body;

        if (!car || !vendor) {
            return res.status(400).json({ success: false, message: "Car and Vendor ID are required" });
        }

        const newRequest = new CarDeleteRequest({
            car,
            reason,
            vendor
        });

        await newRequest.save();

        res.status(201).json({ 
            success: true, 
            message: "Car delete request created successfully", 
            data: newRequest 
        });
    } catch (error) {
        console.error("Error creating car delete request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. Delete Delete Request Controller (process deletion)
export const deleteDeleteCarRequest = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the delete request
        const deleteRequest = await CarDeleteRequest.findById(id);
        if (!deleteRequest) {
            return res.status(404).json({ 
                success: false, 
                message: "Delete request not found" 
            });
        }

        // 2. Check if car exists
        const car = await VendorCar.findById(deleteRequest.car);
        if (!car) {
            // If car doesn't exist, just delete the request
            await CarDeleteRequest.findByIdAndDelete(id);
            return res.status(200).json({ 
                success: true, 
                message: "Delete request processed" 
            });
        }

        // 3. Archive the car
        const carArchive = new CarArchive({
            ...car.toObject(),
            originalCarId: car._id,
            deletionReason: deleteRequest.reason,
            createdAt: car.createdAt,
            updatedAt: car.updatedAt
        });
        await carArchive.save();

        // 4. Delete the original car
        await VendorCar.findByIdAndDelete(car._id);

        // 5. Delete the request
        await CarDeleteRequest.findByIdAndDelete(id);

        res.status(200).json({ 
            success: true, 
            message: "Car archived and request deleted successfully"
        });

    } catch (error) {
        console.error("Error in car deletion process:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error"
        });
    }
};

// 3. Get All Delete Requests
export const getAllDeleteCarRequests = async (req, res) => {
    try {
        const requests = await CarDeleteRequest.find()
            .populate("car") 
            .populate("vendor")
            .sort({ createdAt: -1 }); // optional: get latest first

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error("Error fetching car delete requests:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 4. Check Existing Delete Request
export const checkExistingDeleteCarRequest = async (req, res) => {
    try {
        const { carId } = req.query;

        if (!carId) {
            return res.status(400).json({ 
                success: false, 
                message: "Car ID is required" 
            });
        }

        // Check if car exists in archive
        const archivedCar = await CarArchive.findOne({ originalCarId: carId });
        if (archivedCar) {
            return res.status(200).json({
                success: true,
                exists: false,
                carStatus: 'archived',
                message: "Car has been deleted"
            });
        }

        // Check for existing delete request
        const existingRequest = await CarDeleteRequest.findOne({ car: carId });

        res.status(200).json({
            success: true,
            exists: !!existingRequest,
            carStatus: existingRequest ? 'pending_deletion' : 'active'
        });
    } catch (error) {
        console.error("Error checking existing car delete request:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// 5. Get All Archived Cars
export const getAllArchiveRequests = async (req, res) => {
    try {
        const archives = await CarArchive.find()
            .populate({
                path: 'vendor',
                select: 'username',
                model: 'Vendor'
            })
            .sort({ deletedAt: -1 });

        res.status(200).json({ success: true, data: archives });
    } catch (error) {
        console.error("Error fetching car archive requests:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};