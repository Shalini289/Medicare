const BloodDonor = require("../models/BloodDonor");
const Notification = require("../models/Notification");
const User = require("../models/User");

const getUserId = (req) => req.user.id || req.user._id;

const normalizeDonor = (body) => ({
  name: body.name?.trim() || "",
  bloodGroup: body.bloodGroup,
  city: body.city?.trim() || "",
  phone: body.phone?.trim() || "",
  email: body.email?.trim() || "",
  age: body.age ? Number(body.age) : undefined,
  lastDonationDate: body.lastDonationDate || undefined,
  available: body.available !== false,
  emergencyOnly: Boolean(body.emergencyOnly),
  notes: body.notes?.trim() || "",
});

const validateDonor = (donor) => {
  if (!donor.name || !donor.bloodGroup || !donor.city || !donor.phone) {
    return "Name, blood group, city, and phone are required";
  }

  if (donor.age && (donor.age < 18 || donor.age > 65)) {
    return "Donor age must be between 18 and 65";
  }

  return "";
};

exports.findBloodDonors = async (req, res) => {
  const query = {};

  if (req.query.bloodGroup) query.bloodGroup = req.query.bloodGroup;
  if (req.query.city) query.city = new RegExp(req.query.city.trim(), "i");
  if (req.query.available !== "all") query.available = true;

  const donors = await BloodDonor.find(query)
    .select("-user")
    .sort({ available: -1, city: 1, updatedAt: -1 });

  res.json(donors);
};

exports.getMyBloodDonorProfile = async (req, res) => {
  const donor = await BloodDonor.findOne({ user: getUserId(req) });
  const user = await User.findById(getUserId(req)).select("name email phone");

  res.json({
    donor,
    defaults: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });
};

exports.saveMyBloodDonorProfile = async (req, res) => {
  const payload = normalizeDonor(req.body);
  const validationError = validateDonor(payload);

  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }

  const donor = await BloodDonor.findOneAndUpdate(
    { user: getUserId(req) },
    { ...payload, user: getUserId(req) },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(donor);
};

exports.deleteMyBloodDonorProfile = async (req, res) => {
  await BloodDonor.findOneAndDelete({ user: getUserId(req) });
  res.json({ msg: "Blood donor profile removed" });
};

exports.requestBloodDonor = async (req, res) => {
  const donor = await BloodDonor.findById(req.params.id);

  if (!donor) {
    return res.status(404).json({ msg: "Donor not found" });
  }

  const notification = await Notification.create({
    user: getUserId(req),
    title: "Blood donor contact opened",
    message: `Contact ${donor.name} for ${donor.bloodGroup} blood in ${donor.city}.`,
    type: "system",
  });

  req.app.get("io")?.emit("notification", notification);

  res.json({
    donor,
    msg: "Donor contact ready",
  });
};
