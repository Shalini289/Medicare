const express = require("express");
const {
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
} = require("../controllers/prescriptionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getPrescriptions);
router.post("/", createPrescription);
router.put("/:id", updatePrescription);
router.delete("/:id", deletePrescription);

module.exports = router;
