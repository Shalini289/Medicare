"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import Loader from "../../../components/Loader";
import {
  addDoctorReview,
  getDoctorReviews,
  markReviewHelpful,
} from "@/services/reviewService";
import "@/styles/doctor.css";

export default function DoctorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDoctor = useCallback(async () => {
    try {
      const [data, reviewData] = await Promise.all([
        api(`/api/doctors/${id}`),
        getDoctorReviews(id),
      ]);
      setDoctor(data);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
    } catch {
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchDoctor();
    });
  }, [fetchDoctor]);

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewError("");

    try {
      await addDoctorReview({
        doctor: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      setReviewForm({ rating: 5, comment: "" });
      await fetchDoctor();
    } catch (err) {
      setReviewError(err.message || "Could not save review");
    }
  };

  const markHelpful = async (reviewId) => {
    const updated = await markReviewHelpful(reviewId);
    setReviews((current) =>
      current.map((review) => review._id === reviewId ? updated : review)
    );
  };

  if (loading) return <Loader />;
  if (!doctor) return <p className="empty">Doctor not found</p>;

  return (
    <div className="doctor-page">

      {/* PROFILE */}
      <div className="doctor-profile glass">

        <Image
          src={doctor.image || "/doc.png"}
          alt={doctor.name}
          width={130}
          height={130}
          sizes="130px"
          className="doctor-img"
        />

        <div className="doctor-info">
          <h1>{doctor.name}</h1>
          <p className="spec">{doctor.specialization}</p>

          <div className="meta">
            <span>Rating {doctor.rating || 4.5}</span>
            <span>{doctor.experience} yrs exp</span>
            <span>Rs {doctor.fees}</span>
          </div>

          <button
            className="btn-primary"
            onClick={() => router.push(`/booking?id=${doctor._id}`)}
          >
            Book Appointment
          </button>
        </div>

      </div>

      {/* ABOUT */}
      <div className="doctor-section">
        <h3>About Doctor</h3>
        <p>{doctor.about || "Experienced specialist providing quality care."}</p>
      </div>

      {/* DETAILS */}
      <div className="doctor-section grid">
        <div className="detail-card">
          <h4>Experience</h4>
          <p>{doctor.experience} years</p>
        </div>

        <div className="detail-card">
          <h4>Consultation Fee</h4>
          <p>Rs {doctor.fees}</p>
        </div>

        <div className="detail-card">
          <h4>Specialization</h4>
          <p>{doctor.specialization}</p>
        </div>
      </div>

      <div className="doctor-section reviews-section">
        <div className="reviews-head">
          <div>
            <h3>Patient Reviews</h3>
            <p>{reviews.length} review{reviews.length === 1 ? "" : "s"} for this doctor</p>
          </div>
          <strong>{doctor.rating || "New"} / 5</strong>
        </div>

        <form className="review-compose" onSubmit={submitReview}>
          <label>
            Rating
            <select
              value={reviewForm.rating}
              onChange={(event) =>
                setReviewForm((current) => ({ ...current, rating: event.target.value }))
              }
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} stars</option>
              ))}
            </select>
          </label>

          <label>
            Review
            <textarea
              value={reviewForm.comment}
              onChange={(event) =>
                setReviewForm((current) => ({ ...current, comment: event.target.value }))
              }
              placeholder="Share how the consultation went"
              rows="3"
            />
          </label>

          {reviewError && <p className="review-error">{reviewError}</p>}

          <button className="btn-primary" type="submit">
            Submit Review
          </button>
        </form>

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="empty-state">No reviews yet.</p>
          ) : reviews.map((review) => (
            <article className="review-card" key={review._id}>
              <div>
                <h4>{review.user?.name || "Patient"}</h4>
                <span>{review.rating || 0} / 5</span>
              </div>
              <p>{review.comment || "No comment added."}</p>
              <button onClick={() => markHelpful(review._id)}>
                Helpful ({review.helpful || 0})
              </button>
            </article>
          ))}
        </div>
      </div>

    </div>
  );
}
