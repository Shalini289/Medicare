const MedicalProfile = require("../models/MedicalProfile");

const getUserId = (req) => req.user.id || req.user._id;

const cleanList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const cleanContacts = (contacts = []) =>
  contacts
    .map((contact) => ({
      name: contact.name?.trim() || "",
      relation: contact.relation?.trim() || "",
      phone: contact.phone?.trim() || "",
    }))
    .filter((contact) => contact.name || contact.phone);

const normalizeProfile = (body) => ({
  bloodGroup: body.bloodGroup?.trim() || "",
  allergies: cleanList(body.allergies),
  conditions: cleanList(body.conditions),
  currentMedications: cleanList(body.currentMedications),
  emergencyContacts: cleanContacts(body.emergencyContacts),
  insurance: {
    provider: body.insurance?.provider?.trim() || "",
    policyNumber: body.insurance?.policyNumber?.trim() || "",
    validTill: body.insurance?.validTill || undefined,
  },
  primaryDoctor: body.primaryDoctor?.trim() || "",
  organDonor: Boolean(body.organDonor),
  notes: body.notes?.trim() || "",
});

const calculateCompletion = (profile) => {
  if (!profile) return 0;

  const checks = [
    profile.bloodGroup,
    profile.allergies?.length,
    profile.conditions?.length,
    profile.currentMedications?.length,
    profile.emergencyContacts?.length,
    profile.insurance?.provider,
    profile.primaryDoctor,
    profile.notes,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

exports.getMedicalProfile = async (req, res) => {
  const profile = await MedicalProfile.findOne({ user: getUserId(req) });

  res.json({
    profile,
    completion: calculateCompletion(profile),
  });
};

exports.saveMedicalProfile = async (req, res) => {
  const profile = await MedicalProfile.findOneAndUpdate(
    { user: getUserId(req) },
    { ...normalizeProfile(req.body), user: getUserId(req) },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    profile,
    completion: calculateCompletion(profile),
  });
};
