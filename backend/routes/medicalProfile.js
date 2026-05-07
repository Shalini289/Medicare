const express = require("express");
const {
  getMedicalProfile,
  saveMedicalProfile,
} = require("../controllers/medicalProfileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getMedicalProfile);
router.put("/", saveMedicalProfile);

module.exports = router;
