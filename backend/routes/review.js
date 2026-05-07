const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviews,
  deleteReview,
  markHelpful,
  getTopReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addReview);
router.get("/top/all", getTopReviews);
router.get("/:doctorId", getReviews);
router.put("/:id/helpful", markHelpful);
router.delete("/:id", protect, deleteReview);

module.exports = router;
