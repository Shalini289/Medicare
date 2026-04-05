const express = require("express");
const router = express.Router();

const {
  markTaken,
  markMissed,
  getLogs,
  getStreak
} = require("../controllers/adherenceController");

router.post("/taken", markTaken);
router.post("/missed", markMissed);
router.get("/:patientId", getLogs);
router.get("/streak/:patientId", getStreak);

module.exports = router;