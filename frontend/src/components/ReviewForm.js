"use client";

import { useState } from "react";
import { addDoctorReview } from "@/services/reviewService";

export default function ReviewForm({ doctorId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!comment.trim()) return alert("Write a review");

    try {
      setLoading(true);

      await addDoctorReview({
        doctor: doctorId,
        rating,
        comment,
      });

      alert("Review added");
      setComment("");
      setRating(5);

    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form">

      <h3>Write a Review</h3>

      {/* Star rating */}
      <div className="stars">
        {[1,2,3,4,5].map((n) => (
          <span
            key={n}
            className={n <= rating ? "active" : ""}
            onClick={() => setRating(n)}
          >
            *
          </span>
        ))}
      </div>

      {/* COMMENT */}
      <textarea
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* BUTTON */}
      <button className="btn-primary" onClick={submit}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>

    </div>
  );
}
