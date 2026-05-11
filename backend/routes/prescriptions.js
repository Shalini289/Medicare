const express = require("express");
const {
  getPrescriptions,
} = require("../controllers/prescriptionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getPrescriptions);

module.exports = router;
