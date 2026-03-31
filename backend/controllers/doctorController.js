const Doctor = require("../models/Doctor");

exports.getBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;

  const doctors = await Doctor.find({
  specialization: {
    $regex: specialization.replace(/_/g, " "),
    $options: "i"
  }
});

    res.json(doctors);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};