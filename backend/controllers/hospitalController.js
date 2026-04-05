const Hospital = require("../models/Hospital");

// GET all hospitals
const getHospitals = async (req, res) => {
  const hospitals = await Hospital.find();
  res.json({ success: true, data: hospitals });
};

// UPDATE beds (admin/hospital)
const updateBeds = async (req, res) => {
  const hospital = await Hospital.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  // 🔥 Emit update (real-time)
  req.io.emit("bedUpdate", hospital);

  res.json({ success: true, data: hospital });
};

module.exports = { getHospitals, updateBeds };