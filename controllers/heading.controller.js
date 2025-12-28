import Heading from "../models/heading.model.js";

// GET heading by headingType
export const getHeadingByType = async (req, res) => {
  const { headingType } = req.params;

  try {
    const heading = await Heading.findOne({ headingType });

    if (!heading) {
      return res.status(404).json({ message: "Heading not found" });
    }

    return res.status(200).json(heading);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

// UPDATE heading by headingType
export const updateHeadingByType = async (req, res) => {
  const { headingType } = req.params;
  const { title, description } = req.body;

  try {
    const updatedHeading = await Heading.findOneAndUpdate(
      { headingType },
      { title, description },
      { new: true, runValidators: true }
    );

    if (!updatedHeading) {
      return res.status(404).json({ message: "Heading not found to update" });
    }

    return res.status(200).json(updatedHeading);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};
