const express = require("express");
const router = express.Router();

const {
  getMedicines,
  getPharmacyAlerts,
  getMedicineByBarcode,
  placeOrder,
  getOrders
} = require("../controllers/pharmacyController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", getMedicines);
router.get("/alerts", protect, getPharmacyAlerts);
router.get("/barcode/:barcode", getMedicineByBarcode);
router.post("/order", protect, placeOrder);
router.get("/my-orders", protect, getOrders);

module.exports = router;
