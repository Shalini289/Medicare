const Hospital = require("../models/Hospital");

const getHospitals = async (req, res) => {
  res.json(await Hospital.find());
};

const updateBeds = async (req, res) => {
  if (!req.body.id || !req.body.beds) {
    return res.status(400).json({ msg: "Hospital id and beds are required" });
  }

  const hospital = await Hospital.findByIdAndUpdate(
    req.body.id,
    { beds: req.body.beds },
    { new: true }
  );

  if (!hospital) {
    return res.status(404).json({ msg: "Hospital not found" });
  }

  req.app.get("io").emit("bedUpdate", hospital);

  res.json(hospital);
};

module.exports = { getHospitals, updateBeds };
