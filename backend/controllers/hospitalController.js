const Hospital = require("../models/Hospital");
const User = require("../models/User");
const { normalizePhone, validatePhone } = require("../utils/phoneValidation");

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

const bedTypes = ["ICU", "oxygen", "general"];

const validateBedCounts = (beds = {}, occupiedBeds = {}) => {
  for (const type of bedTypes) {
    const total = Number(beds[type] || 0);
    const occupied = Number(occupiedBeds[type] || 0);

    if (total < 0 || occupied < 0) {
      return `${type} beds cannot be negative`;
    }

    if (occupied > total) {
      return `${type} occupied beds cannot be greater than total beds`;
    }
  }

  return "";
};

const getHospitals = async (req, res) => {
  res.json(await Hospital.find());
};

const ensureHospitalProfile = async (userId) => {
  let hospital = await Hospital.findOne({ user: userId });
  if (hospital) return hospital;

  const user = await User.findById(userId);
  if (!user || user.role !== "hospital") return null;

  hospital = await Hospital.create({
    user: user._id,
    name: user.name || "MediCare Hospital",
    city: "",
    address: "",
    phone: user.phone || "",
    emergencyPhone: "",
    status: "active",
    beds: {
      ICU: 0,
      oxygen: 0,
      general: 0,
    },
    occupiedBeds: {
      ICU: 0,
      oxygen: 0,
      general: 0,
    },
  });

  return hospital;
};

const updateBeds = async (req, res) => {
  if (!req.body.id || !req.body.beds) {
    return res.status(400).json({ msg: "Hospital id and beds are required" });
  }

  if (req.body.occupiedBeds) {
    const validationError = validateBedCounts(req.body.beds, req.body.occupiedBeds);
    if (validationError) return res.status(400).json({ msg: validationError });
  }

  const hospital = await Hospital.findByIdAndUpdate(
    req.body.id,
    {
      beds: req.body.beds,
      ...(req.body.occupiedBeds ? { occupiedBeds: req.body.occupiedBeds } : {}),
    },
    { new: true }
  );

  if (!hospital) {
    return res.status(404).json({ msg: "Hospital not found" });
  }

  req.app.get("io").emit("bedUpdate", hospital);

  res.json(hospital);
};

const getMyHospitalDashboard = async (req, res) => {
  const hospital = await ensureHospitalProfile(req.user.id);

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
    phone: normalizePhone(req.body.phone),
    emergencyPhone: normalizePhone(req.body.emergencyPhone),
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

  const phoneError = validatePhone(payload.phone, "Phone", { required: false }) ||
    validatePhone(payload.emergencyPhone, "Emergency phone", { required: false });
  if (phoneError) {
    return res.status(400).json({ msg: phoneError });
  }

  const validationError = validateBedCounts(payload.beds, payload.occupiedBeds);
  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }

  await ensureHospitalProfile(req.user.id);

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
