import { api } from "@/utils/api";

export const getLabTests = (category = "All") =>
  api(`/api/lab-tests?category=${encodeURIComponent(category)}`);

export const getLabBookings = () =>
  api("/api/lab-tests/bookings");

export const createLabBooking = (payload) =>
  api("/api/lab-tests/bookings", "POST", payload);

export const cancelLabBooking = (id) =>
  api(`/api/lab-tests/bookings/${id}/cancel`, "PUT");

export const getPathologyDashboard = () =>
  api("/api/lab-tests/pathology");

export const updatePathologyBooking = (id, payload) =>
  api(`/api/lab-tests/pathology/bookings/${id}`, "PUT", payload);

export const createPathologyTest = (payload) =>
  api("/api/lab-tests/pathology/tests", "POST", payload);

export const updatePathologyTest = (id, payload) =>
  api(`/api/lab-tests/pathology/tests/${id}`, "PUT", payload);
