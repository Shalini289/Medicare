const express = require("express");
const router = express.Router();

const { getAvailableDoctors } = require("../controllers/availableController");

// GET /api/doctors/available
router.get("/", getAvailableDoctors);

module.exports = router;