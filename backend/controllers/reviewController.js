const Review = require("../models/Review");
const Doctor = require("../models/Doctor");

//
// ⭐ ADD REVIEW
//
const addReview = async (req, res) => {
  try {
    const { doctor, rating, comment } = req.body;

    // ❌ prevent duplicate review
    const exists = await Review.findOne({
      user: req.user.id,
      doctor
    });

    if (exists) {
      return res.status(400).json({ msg: "Already reviewed" });
    }

    const review = await Review.create({
      user: req.user.id,
      doctor,
      rating,
      comment
    });

    //
    // 🔄 UPDATE DOCTOR RATING
    //
    const reviews = await Review.find({ doctor });

    const avg =
      reviews.reduce((acc, r) => acc + r.rating, 0) /
      reviews.length;

    await Doctor.findByIdAndUpdate(doctor, {
      rating: avg.toFixed(1)
    });

    res.json(review);

  } catch (err) {
    res.status(500).json({ msg: "Review failed" });
  }
};

//
// 📥 GET REVIEWS BY DOCTOR
//
const getReviews = async (req, res) => {
  const reviews = await Review.find({
    doctor: req.params.doctorId
  }).populate("user", "name");

  res.json(reviews);
};

//
// ❌ DELETE REVIEW (USER OR ADMIN)
//
const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ msg: "Review not found" });
  }

  // only owner or admin
  if (
    review.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ msg: "Not allowed" });
  }

  await review.deleteOne();

  res.json({ msg: "Review deleted" });
};

//
// 👍 MARK REVIEW AS HELPFUL (BONUS)
//
const markHelpful = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ msg: "Review not found" });
  }

  review.helpful = (review.helpful || 0) + 1;

  await review.save();

  res.json(review);
};

//
// 📊 GET TOP REVIEWS (ADMIN / UI)
//
const getTopReviews = async (req, res) => {
  const reviews = await Review.find()
    .sort({ rating: -1 })
    .limit(10)
    .populate("doctor", "name");

  res.json(reviews);
};

module.exports = {
  addReview,
  getReviews,
  deleteReview,
  markHelpful,
  getTopReviews
};
