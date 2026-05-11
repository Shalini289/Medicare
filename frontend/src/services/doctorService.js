import { api } from "../utils/api";

export const getDoctors = () => api("/api/doctors");

export const getMyDoctorProfile = () => api("/api/doctors/me/profile");

export const getDoctorById = (id) =>
  api(`/api/doctors/${id}`);
