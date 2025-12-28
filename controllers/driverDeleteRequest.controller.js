import DriverArchive from "../models/driverArchive.js";
import DriverDeleteRequest from "../models/driverDeleteRequest.model.js";  // adjust path based on your structure
import MyDriver from "../models/myDriver.model.js";

// 1. Create Delete Request Controller
export const createDeleteRequest = async (req, res) => {
    try {
        const { driver, reason,vendor } = req.body;

        if (!driver || !vendor) {
            return res.status(400).json({ success: false, message: "Driver,Vendor ID is required" });
        }

        const newRequest = new DriverDeleteRequest({
            driver,
            reason,
            vendor
        });

        await newRequest.save();

        res.status(201).json({ success: true, message: "Delete request created successfully", data: newRequest });
    } catch (error) {
        console.error("Error creating delete request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. Delete Delete Request Controller
export const deleteDeleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the delete request
        const deleteRequest = await DriverDeleteRequest.findById(id);
        if (!deleteRequest) {
            return res.status(404).json({ 
                success: false, 
                message: "Delete request not found" 
            });
        }

        // 2. Check if driver exists
        const driver = await MyDriver.findById(deleteRequest.driver);
        if (!driver) {
            // If driver doesn't exist, just delete the request
            await DriverDeleteRequest.findByIdAndDelete(id);
            return res.status(200).json({ 
                success: true, 
                message: "Delete request processed" 
            });
        }

        // 3. Archive the driver
        const driverArchive = new DriverArchive({
            ...driver.toObject(),
            originalDriverId: driver._id,
            deletionReason: deleteRequest.reason,
            createdAt: driver.createdAt,
            updatedAt: driver.updatedAt
        });
        await driverArchive.save();

        // 4. Delete the original driver
        await MyDriver.findByIdAndDelete(driver._id);

        // 5. Delete the request
        await DriverDeleteRequest.findByIdAndDelete(id);

        res.status(200).json({ 
            success: true, 
            message: "Driver archived and request deleted successfully"
        });

    } catch (error) {
        console.error("Error in deletion process:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error"
        });
    }
};


export const getAllDeleteRequests = async (req, res) => {
    try {
        const requests = await DriverDeleteRequest.find()
            .populate("driver") 
            .populate("vendor")
            .sort({ createdAt: -1 }); // optional: get latest first

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error("Error fetching delete requests:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const checkExistingDeleteRequest = async (req, res) => {
  try {
    const { driverId } = req.query;

    if (!driverId) {
      return res.status(400).json({ success: false, message: "Driver ID is required" });
    }

    // Check if driver exists in archive
    const archivedDriver = await DriverArchive.findOne({ originalDriverId: driverId });
    if (archivedDriver) {
      return res.status(200).json({
        success: true,
        exists: false,
        driverStatus: 'archived',
        message: "Driver has been deleted"
      });
    }

    // Check for existing delete request
    const existingRequest = await DriverDeleteRequest.findOne({ driver: driverId });

    res.status(200).json({
      success: true,
      exists: !!existingRequest,
      driverStatus: existingRequest ? 'pending_deletion' : 'active'
    });
  } catch (error) {
    console.error("Error checking existing delete request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getAllArchiveRequests = async (req, res) => {
  try {
    const archives = await DriverArchive.find()
      .populate({
        path: 'driverVendor',
        select: 'username',
        model: 'Vendor'
      })
      .sort({ deletedAt: -1 });

    res.status(200).json({ success: true, data: archives });
  } catch (error) {
    console.error("Error fetching archive requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};