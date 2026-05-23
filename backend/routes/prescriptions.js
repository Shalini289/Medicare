const express = require("express");
const {
  getPrescriptions,
  analyzePrescription,
  handlePrescriptionUploadError,
} = require("../controllers/prescriptionController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../utils/upload");

const router = express.Router();

router.use(protect);

router.post("/analyze", upload.single("file"), handlePrescriptionUploadError, analyzePrescription);
router.get("/", getPrescriptions);

module.exports = router;
