import { api } from "@/utils/api";

export const getLabTests = (category = "All") =>
  api(`/api/lab-tests?category=${encodeURIComponent(category)}`);

export const getLabBookings = () =>
  api("/api/lab-tests/bookings");

export const createLabBooking = (payload) =>
  api("/api/lab-tests/bookings", "POST", payload);

export const cancelLabBooking = (id) =>
  api(`/api/lab-tests/bookings/${id}/cancel`, "PUT");
