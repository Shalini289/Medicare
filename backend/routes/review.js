const express = require("express");
const router = express.Router();

const {
  addReview,
  addHospitalReview,
  getReviews,
  getHospitalReviews,
  deleteReview,
  markHelpful,
  getTopReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addReview);
router.post("/hospital", protect, addHospitalReview);
router.get("/top/all", getTopReviews);
router.get("/hospital/:hospitalId", getHospitalReviews);
router.get("/:doctorId", getReviews);
router.put("/:id/helpful", markHelpful);
router.delete("/:id", protect, deleteReview);

module.exports = router;
