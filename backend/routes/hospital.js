const express = require("express");
const router = express.Router();

const {
  getHospitals,
  updateBeds
} = require("../controllers/hospitalController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getHospitals);
router.put("/beds", protect, admin, updateBeds);

module.exports = router;
