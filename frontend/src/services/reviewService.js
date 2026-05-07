import { api } from "@/utils/api";

export const getDoctorReviews = (doctorId) =>
  api(`/api/review/${doctorId}`);

export const addDoctorReview = (payload) =>
  api("/api/review", "POST", payload);

export const markReviewHelpful = (id) =>
  api(`/api/review/${id}/helpful`, "PUT");

export const deleteDoctorReview = (id) =>
  api(`/api/review/${id}`, "DELETE");
