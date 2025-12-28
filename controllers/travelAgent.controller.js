import TravelAgent from "../models/travelAgent.model.js";

export const signupTravelAgent = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      company_name, 
      company_city,
      password,
      confirmPassword
    } = req.body;
  
    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !company_name || !company_city || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user exists
    const existingAgent = await TravelAgent.findOne({ email });

    if (existingAgent) {
      return res.status(400).json({ message: "Travel agent already exists with this email" });
    }

    // Create and save new agent
    const newAgent = new TravelAgent({
      first_name,
      last_name,
      email,
      phone,
      company_name,
      company_city,
      password 
    });

    await newAgent.save();

    return res.status(201).json({
      success: true,
      message: "Travel agent registered successfully",
      agent: {
        id: newAgent._id,
        first_name: newAgent.first_name,
        last_name: newAgent.last_name,
        email: newAgent.email,
        phone: newAgent.phone,
        company_name: newAgent.company_name,
        company_city: newAgent.company_city
      },
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginTravelAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the travel agent by email
    const agent = await TravelAgent.findOne({ email });

    if (!agent) {
      return res.status(404).json({ message: "Travel agent not found" });
    }

    // Compare raw passwords
    if (agent.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Successful login
    return res.status(200).json({
      success: true,
      message: "Login successful",
      agent: {
        id: agent._id,
        first_name: agent.first_name,
        last_name: agent.last_name,
        email: agent.email,
        phone: agent.phone,
        company_name: agent.company_name,
        company_city: agent.company_city
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
