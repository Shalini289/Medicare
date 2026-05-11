const express = require("express");
const {
  deleteMyBloodDonorProfile,
  findBloodDonors,
  getMyBloodDonorProfile,
  requestBloodDonor,
  saveMyBloodDonorProfile,
} = require("../controllers/bloodDonorController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", findBloodDonors);
router.get("/me", getMyBloodDonorProfile);
router.put("/me", saveMyBloodDonorProfile);
router.delete("/me", deleteMyBloodDonorProfile);
router.post("/:id/request", requestBloodDonor);

module.exports = router;
