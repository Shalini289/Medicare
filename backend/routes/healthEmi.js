const express = require("express");
const { predictHealthEmi } = require("../controllers/healthEmiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/predict", protect, predictHealthEmi);

module.exports = router;
