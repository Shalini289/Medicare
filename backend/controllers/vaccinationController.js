const Vaccination = require("../models/Vaccination");
const Notification = require("../models/Notification");

const getUserId = (req) => req.user.id || req.user._id;

const normalizeVaccination = (body) => ({
  vaccineName: body.vaccineName?.trim(),
  dose: body.dose?.trim() || "",
  dueDate: body.dueDate,
  administeredDate: body.administeredDate || undefined,
  provider: body.provider?.trim() || "",
  location: body.location?.trim() || "",
  notes: body.notes?.trim() || "",
  status: body.status || "scheduled",
});

const withDerivedStatus = (record) => {
  const object = record.toObject ? record.toObject() : record;

  if (
    object.status === "scheduled" &&
    object.dueDate &&
    new Date(object.dueDate) < new Date().setHours(0, 0, 0, 0)
  ) {
    return { ...object, derivedStatus: "overdue" };
  }

  return { ...object, derivedStatus: object.status };
};

const buildSummary = (records) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    total: records.length,
    completed: records.filter((item) => item.status === "completed").length,
    upcoming: records.filter((item) => item.status === "scheduled" && new Date(item.dueDate) >= today).length,
    overdue: records.filter((item) => item.status === "scheduled" && new Date(item.dueDate) < today).length,
  };
};

exports.getVaccinations = async (req, res) => {
  const records = await Vaccination.find({ user: getUserId(req) })
    .sort({ status: 1, dueDate: 1 });

  res.json({
    records: records.map(withDerivedStatus),
    summary: buildSummary(records),
  });
};

exports.createVaccination = async (req, res) => {
  const data = normalizeVaccination(req.body);

  if (!data.vaccineName || !data.dueDate) {
    return res.status(400).json({ msg: "Vaccine name and due date are required" });
  }

  const record = await Vaccination.create({
    ...data,
    user: getUserId(req),
  });

  await Notification.create({
    user: getUserId(req),
    title: "Vaccination scheduled",
    message: `${record.vaccineName} is due on ${new Date(record.dueDate).toLocaleDateString()}.`,
    type: "system",
  });

  res.status(201).json(withDerivedStatus(record));
};

exports.updateVaccination = async (req, res) => {
  const record = await Vaccination.findOneAndUpdate(
    { _id: req.params.id, user: getUserId(req) },
    normalizeVaccination(req.body),
    { new: true, runValidators: true }
  );

  if (!record) {
    return res.status(404).json({ msg: "Vaccination record not found" });
  }

  res.json(withDerivedStatus(record));
};

exports.markVaccinationComplete = async (req, res) => {
  const record = await Vaccination.findOneAndUpdate(
    { _id: req.params.id, user: getUserId(req) },
    {
      status: "completed",
      administeredDate: req.body.administeredDate || new Date(),
      provider: req.body.provider,
      location: req.body.location,
    },
    { new: true, runValidators: true }
  );

  if (!record) {
    return res.status(404).json({ msg: "Vaccination record not found" });
  }

  res.json(withDerivedStatus(record));
};

exports.deleteVaccination = async (req, res) => {
  const record = await Vaccination.findOneAndDelete({
    _id: req.params.id,
    user: getUserId(req),
  });

  if (!record) {
    return res.status(404).json({ msg: "Vaccination record not found" });
  }

  res.json({ msg: "Vaccination record deleted" });
};
