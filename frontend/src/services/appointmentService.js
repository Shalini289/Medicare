import { api } from "../utils/api";
import { getToken } from "../utils/auth";

export const bookAppointment = (data) =>
  api("/api/appointments", "POST", data, getToken());

export const getMyAppointments = () =>
  api("/api/appointments/my", "GET", null, getToken());

export const getSlots = (doctorId, date) =>
  api(`/api/appointments/slots/${doctorId}/${date}`);

export const cancelAppointment = (id) =>
  api(`/api/appointments/cancel/${id}`, "PUT", null, getToken());
