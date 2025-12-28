
import FleetPlan from '../models/vendorPricingFleet.js';

export const getAllPlans = async (req, res) => {
  try {
    const plans = await FleetPlan.find({});
    
    res.status(200).json({
      success: true,
      message: 'Fleet plans fetched successfully',
      data: plans
    });
  } catch (error) {
    console.error('Error fetching fleet plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fleet plans',
      error: error.message
    });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await FleetPlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Fleet plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fleet plan fetched successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Error fetching fleet plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fleet plan',
      error: error.message,
    });
  }
};
