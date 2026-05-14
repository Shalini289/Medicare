const express = require("express");
const router = express.Router();

const {
  getHospitals,
  updateBeds,
  getMyHospitalDashboard,
  updateMyHospital,
} = require("../controllers/hospitalController");
const { protect, admin, hospitalOnly } = require("../middleware/authMiddleware");

router.get("/portal", protect, hospitalOnly, getMyHospitalDashboard);
router.put("/portal", protect, hospitalOnly, updateMyHospital);
router.get("/", getHospitals);
router.put("/beds", protect, admin, updateBeds);

module.exports = router;
