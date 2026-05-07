const Review = require("../models/Review");
const Doctor = require("../models/Doctor");

const getUserId = (req) => req.user.id || req.user._id;

const updateDoctorRating = async (doctorId) => {
  const reviews = await Review.find({ doctor: doctorId });

  const rating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;

  await Doctor.findByIdAndUpdate(doctorId, {
    rating: Number(rating.toFixed(1)),
  });
};

const addReview = async (req, res) => {
  const { doctor, rating, comment } = req.body;

  if (!doctor || !rating) {
    return res.status(400).json({ msg: "Doctor and rating are required" });
  }

  const exists = await Review.findOne({
    user: getUserId(req),
    doctor,
  });

  if (exists) {
    return res.status(400).json({ msg: "Already reviewed" });
  }

  const review = await Review.create({
    user: getUserId(req),
    doctor,
    rating,
    comment,
  });

  await updateDoctorRating(doctor);

  const populated = await review.populate("user", "name");
  res.status(201).json(populated);
};

const getReviews = async (req, res) => {
  const reviews = await Review.find({
    doctor: req.params.doctorId,
  })
    .sort({ createdAt: -1 })
    .populate("user", "name");

  res.json(reviews);
};

const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ msg: "Review not found" });
  }

  if (
    review.user.toString() !== String(getUserId(req)) &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ msg: "Not allowed" });
  }

  const doctorId = review.doctor;
  await review.deleteOne();
  await updateDoctorRating(doctorId);

  res.json({ msg: "Review deleted" });
};

const markHelpful = async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpful: 1 } },
    { new: true }
  ).populate("user", "name");

  if (!review) {
    return res.status(404).json({ msg: "Review not found" });
  }

  res.json(review);
};

const getTopReviews = async (req, res) => {
  const reviews = await Review.find()
    .sort({ rating: -1, helpful: -1 })
    .limit(10)
    .populate("doctor", "name specialization")
    .populate("user", "name");

  res.json(reviews);
};

module.exports = {
  addReview,
  getReviews,
  deleteReview,
  markHelpful,
  getTopReviews,
};
