const express = require("express");
const router = express.Router();

const {
  addAmbulance,
  addDepartment,
  addDoctor,
  addHospital,
  addInsuranceClaim,
  addInvoice,
  addMedicine,
  addStaff,
  deleteAmbulance,
  deleteDepartment,
  deleteDoctor,
  deleteInsuranceClaim,
  deleteInvoice,
  deleteMedicine,
  deleteStaff,
  deleteUser,
  getAmbulancesAdmin,
  getAppointmentsAdmin,
  getDashboardStats,
  getDepartmentsAdmin,
  getDoctorsAdmin,
  getHospitalsAdmin,
  getInsuranceClaimsAdmin,
  getInvoicesAdmin,
  getMedicinesAdmin,
  getOrdersAdmin,
  getStaffAdmin,
  getUsers,
  updateAmbulance,
  updateAppointmentStatus,
  updateDepartment,
  updateDoctor,
  updateHospitalBeds,
  updateInsuranceClaim,
  updateInvoice,
  updateMedicine,
  updateOrderStatus,
  updateStaff,
} = require("../controllers/adminController");

const { protect, admin } = require("../middleware/authMiddleware");

router.use(protect, admin);

router.get("/stats", getDashboardStats);

router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

router.get("/doctors", getDoctorsAdmin);
router.post("/doctors", addDoctor);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

router.get("/appointments", getAppointmentsAdmin);
router.put("/appointments/:id", updateAppointmentStatus);

router.get("/medicines", getMedicinesAdmin);
router.post("/medicines", addMedicine);
router.put("/medicines/:id", updateMedicine);
router.delete("/medicines/:id", deleteMedicine);

router.get("/orders", getOrdersAdmin);
router.put("/orders/:id", updateOrderStatus);

router.get("/hospitals", getHospitalsAdmin);
router.post("/hospitals", addHospital);
router.put("/hospitals/:id", updateHospitalBeds);

router.get("/staff", getStaffAdmin);
router.post("/staff", addStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

router.get("/invoices", getInvoicesAdmin);
router.post("/invoices", addInvoice);
router.put("/invoices/:id", updateInvoice);
router.delete("/invoices/:id", deleteInvoice);

router.get("/insurance-claims", getInsuranceClaimsAdmin);
router.post("/insurance-claims", addInsuranceClaim);
router.put("/insurance-claims/:id", updateInsuranceClaim);
router.delete("/insurance-claims/:id", deleteInsuranceClaim);

router.get("/ambulances", getAmbulancesAdmin);
router.post("/ambulances", addAmbulance);
router.put("/ambulances/:id", updateAmbulance);
router.delete("/ambulances/:id", deleteAmbulance);

router.get("/departments", getDepartmentsAdmin);
router.post("/departments", addDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

module.exports = router;
