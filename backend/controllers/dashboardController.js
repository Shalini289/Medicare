const Appointment = require("../models/Appointment");
const Order = require("../models/Order");
const MedicineLog = require("../models/MedicineLog");
const Vital = require("../models/Vital");
const Prescription = require("../models/Prescription");
const CarePlan = require("../models/CarePlan");
const LabBooking = require("../models/LabBooking");
const Vaccination = require("../models/Vaccination");
const MedicalProfile = require("../models/MedicalProfile");
const Report = require("../models/Report");
const Notification = require("../models/Notification");

const getUserId = (req) => req.user.id || req.user._id;

const todayDate = () => new Date().toISOString().slice(0, 10);

const getMedicalProfileCompletion = (profile) => {
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

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const getVitalAlerts = (vital) => {
  if (!vital) return [];

  const alerts = [];
  if (vital.systolic >= 140 || vital.diastolic >= 90) alerts.push("High blood pressure");
  if (vital.oxygen && vital.oxygen < 94) alerts.push("Low oxygen");
  if (vital.temperature && vital.temperature >= 100.4) alerts.push("Fever");
  if (vital.bloodSugar && vital.bloodSugar > 180) alerts.push("High blood sugar");
  return alerts;
};

const buildActionItems = ({
  upcomingAppointment,
  unreadNotifications,
  overdueVaccines,
  activeCarePlans,
  activeReminders,
  medicalProfileCompletion,
  latestVital,
}) => {
  const actions = [];

  if (upcomingAppointment) {
    actions.push({
      title: "Upcoming appointment",
      text: `${upcomingAppointment.date} at ${upcomingAppointment.time}`,
      href: "/profile",
    });
  }

  if (unreadNotifications > 0) {
    actions.push({
      title: "Unread notifications",
      text: `${unreadNotifications} update${unreadNotifications > 1 ? "s" : ""} need attention`,
      href: "/notifications",
    });
  }

  if (overdueVaccines > 0) {
    actions.push({
      title: "Overdue vaccines",
      text: `${overdueVaccines} vaccine record${overdueVaccines > 1 ? "s are" : " is"} overdue`,
      href: "/vaccinations",
    });
  }

  if (activeCarePlans > 0) {
    actions.push({
      title: "Care plan tasks",
      text: `${activeCarePlans} active care plan${activeCarePlans > 1 ? "s" : ""}`,
      href: "/care-plans",
    });
  }

  if (activeReminders > 0) {
    actions.push({
      title: "Medicine schedule",
      text: `${activeReminders} active reminder${activeReminders > 1 ? "s" : ""}`,
      href: "/reminders",
    });
  }

  if (medicalProfileCompletion < 80) {
    actions.push({
      title: "Complete Medical ID",
      text: `${medicalProfileCompletion}% complete`,
      href: "/medical-id",
    });
  }

  const vitalAlerts = getVitalAlerts(latestVital);
  if (vitalAlerts.length > 0) {
    actions.push({
      title: "Vitals attention",
      text: vitalAlerts.join(", "),
      href: "/vitals",
    });
  }

  return actions.slice(0, 6);
};

exports.getDashboard = async (req, res) => {
  const userId = getUserId(req);
  const today = todayDate();
  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    upcomingAppointment,
    appointmentCount,
    activeOrders,
    activeReminders,
    latestVital,
    prescriptionCount,
    activeCarePlans,
    pendingLabBookings,
    overdueVaccines,
    completedVaccines,
    medicalProfile,
    reportCount,
    unreadNotifications,
    latestNotifications,
  ] = await Promise.all([
    Appointment.findOne({ user: userId, status: "booked", date: { $gte: today } })
      .sort({ date: 1, time: 1 })
      .populate("doctor", "name specialization"),
    Appointment.countDocuments({ user: userId }),
    Order.countDocuments({ user: userId, status: { $ne: "delivered" } }),
    MedicineLog.countDocuments({ user: userId, active: true }),
    Vital.findOne({ user: userId }).sort({ recordedAt: -1 }),
    Prescription.countDocuments({ user: userId, status: "active" }),
    CarePlan.countDocuments({ user: userId, status: "active" }),
    LabBooking.countDocuments({
      user: userId,
      status: { $in: ["scheduled", "sample_collected"] },
      collectionDate: { $gte: now },
    }),
    Vaccination.countDocuments({
      user: userId,
      status: "scheduled",
      dueDate: { $lt: startOfToday },
    }),
    Vaccination.countDocuments({ user: userId, status: "completed" }),
    MedicalProfile.findOne({ user: userId }),
    Report.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, read: false }),
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
  ]);

  const medicalProfileCompletion = getMedicalProfileCompletion(medicalProfile);

  const stats = [
    { label: "Appointments", value: appointmentCount, href: "/profile" },
    { label: "Active orders", value: activeOrders, href: "/orders" },
    { label: "Reminders", value: activeReminders, href: "/reminders" },
    { label: "Prescriptions", value: prescriptionCount, href: "/prescriptions" },
    { label: "Care plans", value: activeCarePlans, href: "/care-plans" },
    { label: "Lab bookings", value: pendingLabBookings, href: "/lab-tests" },
    { label: "Overdue vaccines", value: overdueVaccines, href: "/vaccinations" },
    { label: "Reports", value: reportCount, href: "/reports" },
  ];

  const actionItems = buildActionItems({
    upcomingAppointment,
    unreadNotifications,
    overdueVaccines,
    activeCarePlans,
    activeReminders,
    medicalProfileCompletion,
    latestVital,
  });

  res.json({
    stats,
    actionItems,
    upcomingAppointment,
    latestVital,
    vitalAlerts: getVitalAlerts(latestVital),
    medicalProfileCompletion,
    completedVaccines,
    unreadNotifications,
    latestNotifications,
  });
};
