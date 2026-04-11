const express = require("express");
const router = express.Router();

const {
  getDashboardStats,

  getUsers,
  deleteUser,

  getDoctorsAdmin,
  addDoctor,
  updateDoctor,
  deleteDoctor,

  getAppointmentsAdmin,
  updateAppointmentStatus,

  getMedicinesAdmin,
  addMedicine,
  updateMedicine,
  deleteMedicine,

  getOrdersAdmin,
  updateOrderStatus,

  getHospitalsAdmin,
  addHospital,
  updateHospitalBeds

} = require("../controllers/adminController");

const {
  protect,
  admin
} = require("../middleware/authMiddleware");

//
// 📊 Dashboard
//
router.get("/stats", (req, res) => {
  res.json({ msg: "Admin stats working" });
});
router.get("/stats", protect, admin, getDashboardStats);

//
// 👤 Users
//
router.get("/users", protect, admin, getUsers);
router.delete("/users/:id", protect, admin, deleteUser);

//
// 🧑‍⚕️ Doctors
//
router.get("/doctors", protect, admin, getDoctorsAdmin);
router.post("/doctors", protect, admin, addDoctor);
router.put("/doctors/:id", protect, admin, updateDoctor);
router.delete("/doctors/:id", protect, admin, deleteDoctor);

//
// 📅 Appointments
//
router.get("/appointments", protect, admin, getAppointmentsAdmin);
router.put("/appointments/:id", protect, admin, updateAppointmentStatus);
router.put("/doctors/:id", protect,admin,updateDoctor);
//
// 💊 Medicines
//
router.get("/medicines", protect, admin, getMedicinesAdmin);
router.post("/medicines", protect, admin, addMedicine);
router.put("/medicines/:id", protect, admin, updateMedicine);
router.delete("/medicines/:id", protect, admin, deleteMedicine);

//
// 📦 Orders
//
router.get("/orders", protect, admin, getOrdersAdmin);
router.put("/orders/:id", protect, admin, updateOrderStatus);

//
// 🏥 Hospitals
//
router.get("/hospitals", protect, admin, getHospitalsAdmin);
router.post("/hospitals", protect, admin, addHospital);
router.put("/hospitals/:id", protect, admin, updateHospitalBeds);

module.exports = router;