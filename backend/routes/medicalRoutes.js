const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const {
  uploadReport,
  getReportsByPatient
} = require("../controllers/medicalController");

// Upload report
router.post("/upload", upload.single("file"), uploadReport);

// Get reports
router.get("/:patientId", getReportsByPatient);

module.exports = router;