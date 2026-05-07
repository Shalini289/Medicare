const express = require("express");
const {
  getVaccinations,
  createVaccination,
  updateVaccination,
  markVaccinationComplete,
  deleteVaccination,
} = require("../controllers/vaccinationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getVaccinations);
router.post("/", createVaccination);
router.put("/:id", updateVaccination);
router.put("/:id/complete", markVaccinationComplete);
router.delete("/:id", deleteVaccination);

module.exports = router;
