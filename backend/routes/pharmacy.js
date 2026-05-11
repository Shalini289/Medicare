const express = require("express");
const router = express.Router();

const {
  getMedicines,
  getPharmacyAlerts,
  getMedicineByBarcode,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  placeOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/pharmacyController");

const { protect, pharmacyStaff } = require("../middleware/authMiddleware");

router.get("/", getMedicines);
router.get("/alerts", protect, getPharmacyAlerts);
router.get("/barcode/:barcode", getMedicineByBarcode);
router.get("/orders", protect, pharmacyStaff, getAllOrders);
router.put("/orders/:id/status", protect, pharmacyStaff, updateOrderStatus);
router.post("/", protect, pharmacyStaff, createMedicine);
router.put("/:id", protect, pharmacyStaff, updateMedicine);
router.delete("/:id", protect, pharmacyStaff, deleteMedicine);
router.post("/order", protect, placeOrder);
router.get("/my-orders", protect, getOrders);

module.exports = router;
