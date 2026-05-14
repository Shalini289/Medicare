const Hospital = require("../models/Hospital");

const buildHospitalSummary = (hospital) => {
  const beds = hospital.beds || {};
  const occupied = hospital.occupiedBeds || {};
  const total = {
    ICU: Number(beds.ICU || 0),
    oxygen: Number(beds.oxygen || 0),
    general: Number(beds.general || 0),
  };
  const used = {
    ICU: Number(occupied.ICU || 0),
    oxygen: Number(occupied.oxygen || 0),
    general: Number(occupied.general || 0),
  };
  const available = {
    ICU: Math.max(total.ICU - used.ICU, 0),
    oxygen: Math.max(total.oxygen - used.oxygen, 0),
    general: Math.max(total.general - used.general, 0),
  };

  return {
    totalBeds: total.ICU + total.oxygen + total.general,
    occupiedBeds: used.ICU + used.oxygen + used.general,
    availableBeds: available.ICU + available.oxygen + available.general,
    available,
  };
};

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

const getMyHospitalDashboard = async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user.id });

  if (!hospital) {
    return res.status(404).json({ msg: "Hospital profile not found" });
  }

  res.json({
    hospital,
    summary: buildHospitalSummary(hospital),
  });
};

const updateMyHospital = async (req, res) => {
  const payload = {
    name: req.body.name?.trim(),
    city: req.body.city?.trim(),
    address: req.body.address?.trim() || "",
    phone: req.body.phone?.trim() || "",
    emergencyPhone: req.body.emergencyPhone?.trim() || "",
    status: req.body.status || "active",
    beds: {
      ICU: Number(req.body.beds?.ICU || 0),
      oxygen: Number(req.body.beds?.oxygen || 0),
      general: Number(req.body.beds?.general || 0),
    },
    occupiedBeds: {
      ICU: Number(req.body.occupiedBeds?.ICU || 0),
      oxygen: Number(req.body.occupiedBeds?.oxygen || 0),
      general: Number(req.body.occupiedBeds?.general || 0),
    },
  };

  if (!payload.name || !payload.city) {
    return res.status(400).json({ msg: "Hospital name and city are required" });
  }

  const hospital = await Hospital.findOneAndUpdate(
    { user: req.user.id },
    payload,
    { new: true, runValidators: true }
  );

  if (!hospital) {
    return res.status(404).json({ msg: "Hospital profile not found" });
  }

  req.app.get("io")?.emit("bedUpdate", hospital);

  res.json({
    hospital,
    summary: buildHospitalSummary(hospital),
  });
};

module.exports = {
  getHospitals,
  updateBeds,
  getMyHospitalDashboard,
  updateMyHospital,
};
