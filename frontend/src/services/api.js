// app/services/api.js

import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");;

export const predictAPI = (data) =>
  axios.post(`${API_URL}/api/predict`, data);

export const getDoctorsAPI = (specialization) =>
  axios.get(`${API_URL}/api/doctors/${specialization}`);

export const bookAppointmentAPI = (data, token) =>
  axios.post(`${API_URL}/api/appointments/book`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });