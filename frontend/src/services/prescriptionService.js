import { api } from "@/utils/api";

export const getPrescriptions = () =>
  api("/api/prescriptions");

export const createPrescription = (payload) =>
  api("/api/prescriptions", "POST", payload);

export const updatePrescription = (id, payload) =>
  api(`/api/prescriptions/${id}`, "PUT", payload);

export const deletePrescription = (id) =>
  api(`/api/prescriptions/${id}`, "DELETE");
