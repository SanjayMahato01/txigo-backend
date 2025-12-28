import Order from '../models/orders.model.js';

export const updateMissedOrders = async () => {
  try {
    const currentDateTime = new Date();

    const ordersToUpdate = await Order.find({
      vendor: { $ne: null },
      pickupDate: { $exists: true },
      pickupTime: { $exists: true }, 
      broadcastStatus: { $ne: "missed" }
    });

    for (const order of ordersToUpdate) {
      const pickupDate = new Date(order.pickupDate);

      if (pickupDate < currentDateTime.setHours(0, 0, 0, 0)) {
        // Date is before today → mark as missed directly
        order.broadcastStatus = "missed";
        await order.save();
        console.log(`Order ${order._id} marked as missed (past date)`);
      } else if (pickupDate.toDateString() === currentDateTime.toDateString()) {
        // Same day → compare time
        const [hours, minutes] = order.pickupTime.split(":").map(Number);

        const pickupDateTime = new Date(pickupDate);
        pickupDateTime.setHours(hours, minutes, 0, 0);

        if (pickupDateTime < currentDateTime) {
          order.broadcastStatus = "missed";
          await order.save();
          console.log(`Order ${order._id} marked as missed (time passed)`);
        }
      }
    }

    console.log("Missed orders updated successfully.");
  } catch (error) {
    console.error("Error updating missed orders:", error);
  }
};
