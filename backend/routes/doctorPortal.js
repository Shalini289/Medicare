const express = require("express");
const {
  createDoctorNote,
  createPatientPrescription,
  getDiagnosisSuggestions,
  getDoctorDashboard,
  getDoctorNotes,
  scheduleAppointment,
  updateAppointmentStatus,
  updateAvailability,
} = require("../controllers/doctorPortalController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDoctorDashboard);
router.put("/availability", updateAvailability);
router.post("/appointments", scheduleAppointment);
router.put("/appointments/:id/status", updateAppointmentStatus);
router.get("/notes", getDoctorNotes);
router.post("/notes", createDoctorNote);
router.post("/prescriptions", createPatientPrescription);
router.post("/diagnosis-suggestions", getDiagnosisSuggestions);

module.exports = router;
