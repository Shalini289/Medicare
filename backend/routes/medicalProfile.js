const express = require("express");
const {
  getMedicalProfile,
  getEmergencyContacts,
  saveMedicalProfile,
  saveEmergencyContacts,
  sendEmergencyAlert,
} = require("../controllers/medicalProfileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getMedicalProfile);
router.put("/", saveMedicalProfile);
router.get("/emergency-contacts", getEmergencyContacts);
router.put("/emergency-contacts", saveEmergencyContacts);
router.post("/emergency-alert", sendEmergencyAlert);

module.exports = router;
