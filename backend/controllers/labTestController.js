const LabTest = require("../models/LabTest");
const LabBooking = require("../models/LabBooking");
const Notification = require("../models/Notification");

const defaultTests = [
  {
    name: "Complete Blood Count",
    category: "General",
    price: 399,
    sampleType: "Blood",
    reportTime: "12 hours",
    description: "Measures hemoglobin, WBC, RBC, and platelet levels.",
  },
  {
    name: "Diabetes Screening",
    category: "Diabetes",
    price: 549,
    sampleType: "Blood",
    fastingRequired: true,
    reportTime: "24 hours",
    description: "Includes fasting glucose and HbA1c trend markers.",
  },
  {
    name: "Lipid Profile",
    category: "Heart",
    price: 699,
    sampleType: "Blood",
    fastingRequired: true,
    reportTime: "24 hours",
    description: "Checks cholesterol, LDL, HDL, and triglycerides.",
  },
  {
    name: "Thyroid Profile",
    category: "Hormones",
    price: 599,
    sampleType: "Blood",
    reportTime: "24 hours",
    description: "Tracks T3, T4, and TSH levels.",
  },
  {
    name: "Liver Function Test",
    category: "Organ Health",
    price: 799,
    sampleType: "Blood",
    reportTime: "24 hours",
    description: "Reviews bilirubin, SGOT, SGPT, and enzyme markers.",
  },
  {
    name: "Kidney Function Test",
    category: "Organ Health",
    price: 749,
    sampleType: "Blood",
    reportTime: "24 hours",
    description: "Checks creatinine, urea, and electrolyte balance.",
  },
  {
    name: "Vitamin D",
    category: "Vitamins",
    price: 899,
    sampleType: "Blood",
    reportTime: "36 hours",
    description: "Measures vitamin D deficiency risk.",
  },
];

const getUserId = (req) => req.user.id || req.user._id;

const ensureDefaultTests = async () => {
  const count = await LabTest.countDocuments();
  if (count === 0) {
    await LabTest.insertMany(defaultTests);
  }
};

exports.getLabTests = async (req, res) => {
  await ensureDefaultTests();

  const query = { active: true };
  if (req.query.category && req.query.category !== "All") {
    query.category = req.query.category;
  }

  const tests = await LabTest.find(query).sort({ category: 1, name: 1 });
  const categories = ["All", ...new Set(tests.map((test) => test.category))];

  res.json({ tests, categories });
};

exports.getMyLabBookings = async (req, res) => {
  const bookings = await LabBooking.find({ user: getUserId(req) })
    .populate("tests.test")
    .sort({ collectionDate: -1, createdAt: -1 });

  res.json(bookings);
};

exports.createLabBooking = async (req, res) => {
  const { tests, collectionDate, slot, address, notes } = req.body;

  if (!Array.isArray(tests) || tests.length === 0) {
    return res.status(400).json({ msg: "Select at least one lab test" });
  }

  if (!collectionDate || !slot || !address?.trim()) {
    return res.status(400).json({ msg: "Collection date, slot, and address are required" });
  }

  const selectedTests = await LabTest.find({
    _id: { $in: tests },
    active: true,
  });

  if (selectedTests.length !== tests.length) {
    return res.status(400).json({ msg: "Some selected tests are unavailable" });
  }

  const bookingTests = selectedTests.map((test) => ({
    test: test._id,
    price: test.price,
  }));
  const total = selectedTests.reduce((sum, test) => sum + Number(test.price || 0), 0);

  const booking = await LabBooking.create({
    user: getUserId(req),
    tests: bookingTests,
    collectionDate,
    slot,
    address: address.trim(),
    notes: notes?.trim() || "",
    total,
  });

  await Notification.create({
    user: getUserId(req),
    title: "Lab test booked",
    message: `Sample collection scheduled for ${new Date(collectionDate).toLocaleDateString()} (${slot}).`,
    type: "system",
  });

  const populated = await booking.populate("tests.test");
  res.status(201).json(populated);
};

exports.cancelLabBooking = async (req, res) => {
  const booking = await LabBooking.findOneAndUpdate(
    {
      _id: req.params.id,
      user: getUserId(req),
      status: { $ne: "report_ready" },
    },
    { status: "cancelled" },
    { new: true }
  ).populate("tests.test");

  if (!booking) {
    return res.status(404).json({ msg: "Booking not found or cannot be cancelled" });
  }

  res.json(booking);
};

exports.getPathologyDashboard = async (req, res) => {
  const [bookings, tests] = await Promise.all([
    LabBooking.find()
      .populate("user", "name email phone")
      .populate("tests.test")
      .sort({ collectionDate: -1, createdAt: -1 }),
    LabTest.find().sort({ active: -1, category: 1, name: 1 }),
  ]);

  const stats = {
    totalBookings: bookings.length,
    scheduled: bookings.filter((booking) => booking.status === "scheduled").length,
    sampleCollected: bookings.filter((booking) => booking.status === "sample_collected").length,
    reportReady: bookings.filter((booking) => booking.status === "report_ready").length,
    cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
    activeTests: tests.filter((test) => test.active).length,
    revenue: bookings
      .filter((booking) => booking.status !== "cancelled")
      .reduce((sum, booking) => sum + Number(booking.total || 0), 0),
  };

  res.json({ stats, bookings, tests });
};

exports.updatePathologyBooking = async (req, res) => {
  const allowedStatuses = ["scheduled", "sample_collected", "report_ready", "cancelled"];
  const status = req.body.status;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ msg: "Select a valid booking status" });
  }

  const update = {
    status,
    pathologyNotes: req.body.pathologyNotes?.trim() || "",
    reportSummary: req.body.reportSummary?.trim() || "",
  };

  if (status === "sample_collected") update.sampleCollectedAt = new Date();
  if (status === "report_ready") update.reportReadyAt = new Date();

  const booking = await LabBooking.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true }
  )
    .populate("user", "name email phone")
    .populate("tests.test");

  if (!booking) {
    return res.status(404).json({ msg: "Lab booking not found" });
  }

  await Notification.create({
    user: booking.user?._id || booking.user,
    title: status === "report_ready" ? "Lab report ready" : "Lab booking updated",
    message: status === "report_ready"
      ? "Your lab report is ready for review."
      : `Your lab booking status is now ${status.replace("_", " ")}.`,
    type: "system",
  });

  res.json(booking);
};

exports.createPathologyTest = async (req, res) => {
  if (!req.body.name?.trim()) {
    return res.status(400).json({ msg: "Test name is required" });
  }

  const test = await LabTest.create({
    name: req.body.name.trim(),
    category: req.body.category?.trim() || "General",
    price: Number(req.body.price || 0),
    sampleType: req.body.sampleType?.trim() || "Blood",
    fastingRequired: Boolean(req.body.fastingRequired),
    reportTime: req.body.reportTime?.trim() || "24 hours",
    description: req.body.description?.trim() || "",
    active: req.body.active !== false,
  });

  res.status(201).json(test);
};

exports.updatePathologyTest = async (req, res) => {
  const test = await LabTest.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name?.trim(),
      category: req.body.category?.trim() || "General",
      price: Number(req.body.price || 0),
      sampleType: req.body.sampleType?.trim() || "Blood",
      fastingRequired: Boolean(req.body.fastingRequired),
      reportTime: req.body.reportTime?.trim() || "24 hours",
      description: req.body.description?.trim() || "",
      active: Boolean(req.body.active),
    },
    { new: true, runValidators: true }
  );

  if (!test) {
    return res.status(404).json({ msg: "Lab test not found" });
  }

  res.json(test);
};
