const express = require("express");
const router = express.Router();

const {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  addDoctor,
  deleteDoctor
} = require("../controllers/doctorController");

const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getDoctors);
router.get("/me/profile", protect, getMyDoctorProfile);
router.get("/:id", getDoctorById);

router.post("/", protect, admin, addDoctor);
router.delete("/:id", protect, admin, deleteDoctor);

module.exports = router;
