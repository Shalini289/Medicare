import { api } from "@/utils/api";

const withDoctor = (path, doctorId) => {
  const separator = path.includes("?") ? "&" : "?";
  return doctorId ? `${path}${separator}doctorId=${encodeURIComponent(doctorId)}` : path;
};

export const getDoctorPortalDashboard = (doctorId) =>
  api(withDoctor("/api/doctor-portal/dashboard", doctorId));

export const updateDoctorAvailability = (doctorId, payload) =>
  api("/api/doctor-portal/availability", "PUT", { ...payload, doctorId });

export const scheduleDoctorAppointment = (doctorId, payload) =>
  api("/api/doctor-portal/appointments", "POST", { ...payload, doctorId });

export const updateDoctorAppointmentStatus = (doctorId, id, status) =>
  api(`/api/doctor-portal/appointments/${id}/status`, "PUT", { doctorId, status });

export const createDoctorNote = (doctorId, payload) =>
  api("/api/doctor-portal/notes", "POST", { ...payload, doctorId });

export const getDoctorNotes = (doctorId, patientId = "") =>
  api(withDoctor(`/api/doctor-portal/notes${patientId ? `?patientId=${patientId}` : ""}`, doctorId));

export const createDoctorPrescription = (doctorId, payload) =>
  api("/api/doctor-portal/prescriptions", "POST", { ...payload, doctorId });

export const getDoctorDiagnosisSuggestions = (doctorId, payload) =>
  api("/api/doctor-portal/diagnosis-suggestions", "POST", { ...payload, doctorId });
