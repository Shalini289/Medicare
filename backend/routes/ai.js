const express = require("express");
const router = express.Router();

const { symptomCheck } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/symptoms", protect, symptomCheck);

module.exports = router;
