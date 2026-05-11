const MedicalProfile = require("../models/MedicalProfile");
const Notification = require("../models/Notification");
const {
  decryptList,
  decryptString,
  encryptList,
  encryptString,
} = require("../utils/fieldCrypto");

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

const cleanHistory = (history = []) =>
  history
    .map((entry) => ({
      type: entry.type || "visit",
      title: entry.title?.trim() || "",
      doctorName: entry.doctorName?.trim() || "",
      facility: entry.facility?.trim() || "",
      date: entry.date || new Date(),
      notes: entry.notes?.trim() || "",
      attachments: cleanList(entry.attachments),
    }))
    .filter((entry) => entry.title || entry.notes || entry.doctorName || entry.facility);

const encryptHistory = (history = []) =>
  history.map((entry) => ({
    ...entry,
    title: encryptString(entry.title),
    doctorName: encryptString(entry.doctorName),
    facility: encryptString(entry.facility),
    notes: encryptString(entry.notes),
    attachments: encryptList(entry.attachments),
  }));

const decryptHistory = (history = []) =>
  history.map((entry) => ({
    ...entry.toObject?.() || entry,
    title: decryptString(entry.title),
    doctorName: decryptString(entry.doctorName),
    facility: decryptString(entry.facility),
    notes: decryptString(entry.notes),
    attachments: decryptList(entry.attachments),
  }));

const decryptContacts = (contacts = []) =>
  contacts.map((contact) => ({
    ...contact.toObject?.() || contact,
    name: decryptString(contact.name),
    relation: decryptString(contact.relation),
    phone: decryptString(contact.phone),
  }));

const decryptProfile = (profile) => {
  if (!profile) return profile;

  const data = profile.toObject ? profile.toObject() : profile;

  return {
    ...data,
    allergies: decryptList(data.allergies),
    conditions: decryptList(data.conditions),
    currentMedications: decryptList(data.currentMedications),
    medicalHistory: decryptHistory(data.medicalHistory || []),
    emergencyContacts: decryptContacts(data.emergencyContacts || []),
    insurance: {
      ...data.insurance,
      provider: decryptString(data.insurance?.provider || ""),
      policyNumber: decryptString(data.insurance?.policyNumber || ""),
    },
    primaryDoctor: decryptString(data.primaryDoctor),
    notes: decryptString(data.notes),
  };
};

const normalizeProfile = (body) => ({
  bloodGroup: body.bloodGroup?.trim() || "",
  allergies: encryptList(cleanList(body.allergies)),
  conditions: encryptList(cleanList(body.conditions)),
  currentMedications: encryptList(cleanList(body.currentMedications)),
  medicalHistory: encryptHistory(cleanHistory(body.medicalHistory)),
  emergencyContacts: cleanContacts(body.emergencyContacts).map((contact) => ({
    name: encryptString(contact.name),
    relation: encryptString(contact.relation),
    phone: encryptString(contact.phone),
  })),
  insurance: {
    provider: encryptString(body.insurance?.provider?.trim() || ""),
    policyNumber: encryptString(body.insurance?.policyNumber?.trim() || ""),
    validTill: body.insurance?.validTill || undefined,
  },
  primaryDoctor: encryptString(body.primaryDoctor?.trim() || ""),
  organDonor: Boolean(body.organDonor),
  notes: encryptString(body.notes?.trim() || ""),
});

const calculateCompletion = (profile) => {
  if (!profile) return 0;

  const checks = [
    profile.bloodGroup,
    profile.allergies?.length,
    profile.conditions?.length,
    profile.currentMedications?.length,
    profile.medicalHistory?.length,
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
  const decryptedProfile = decryptProfile(profile);

  res.json({
    profile: decryptedProfile,
    completion: calculateCompletion(profile),
    encryptedAtRest: true,
  });
};

exports.saveMedicalProfile = async (req, res) => {
  const profile = await MedicalProfile.findOneAndUpdate(
    { user: getUserId(req) },
    { ...normalizeProfile(req.body), user: getUserId(req) },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    profile: decryptProfile(profile),
    completion: calculateCompletion(profile),
    encryptedAtRest: true,
  });
};

exports.getEmergencyContacts = async (req, res) => {
  const profile = await MedicalProfile.findOne({ user: getUserId(req) });
  const decryptedProfile = decryptProfile(profile);

  res.json({
    contacts: decryptedProfile?.emergencyContacts || [],
    medicalSummary: {
      bloodGroup: decryptedProfile?.bloodGroup || "",
      allergies: decryptedProfile?.allergies || [],
      conditions: decryptedProfile?.conditions || [],
      currentMedications: decryptedProfile?.currentMedications || [],
      primaryDoctor: decryptedProfile?.primaryDoctor || "",
      organDonor: Boolean(profile?.organDonor),
      notes: decryptedProfile?.notes || "",
    },
  });
};

exports.saveEmergencyContacts = async (req, res) => {
  const contacts = cleanContacts(req.body.contacts || req.body.emergencyContacts || []);

  if (contacts.length === 0) {
    return res.status(400).json({ msg: "Add at least one emergency contact" });
  }

  const profile = await MedicalProfile.findOneAndUpdate(
    { user: getUserId(req) },
    {
      emergencyContacts: contacts.map((contact) => ({
        name: encryptString(contact.name),
        relation: encryptString(contact.relation),
        phone: encryptString(contact.phone),
      })),
      user: getUserId(req),
    },
    { new: true, upsert: true, runValidators: true }
  );
  const decryptedProfile = decryptProfile(profile);

  res.json({
    contacts: decryptedProfile.emergencyContacts,
    medicalSummary: {
      bloodGroup: decryptedProfile.bloodGroup || "",
      allergies: decryptedProfile.allergies || [],
      conditions: decryptedProfile.conditions || [],
      currentMedications: decryptedProfile.currentMedications || [],
      primaryDoctor: decryptedProfile.primaryDoctor || "",
      organDonor: Boolean(profile.organDonor),
      notes: decryptedProfile.notes || "",
    },
  });
};

exports.sendEmergencyAlert = async (req, res) => {
  const profile = await MedicalProfile.findOne({ user: getUserId(req) });
  const decryptedProfile = decryptProfile(profile);
  const contactCount = profile?.emergencyContacts?.length || 0;
  const location = req.body.location?.trim();

  const notification = await Notification.create({
    user: getUserId(req),
    title: "Emergency alert triggered",
    message: [
      `Emergency alert sent to ${contactCount} contact${contactCount === 1 ? "" : "s"}.`,
      decryptedProfile?.bloodGroup ? `Blood group: ${decryptedProfile.bloodGroup}.` : "",
      location ? `Location: ${location}.` : "",
    ].filter(Boolean).join(" "),
    type: "emergency",
  });

  req.app.get("io")?.emit("notification", notification);

  res.status(201).json({
    msg: "Emergency alert recorded",
    notification,
    contacts: decryptedProfile?.emergencyContacts || [],
  });
};
