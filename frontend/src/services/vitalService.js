import { api } from "@/utils/api";

export const getVitals = () =>
  api("/api/vitals");

export const createVital = (payload) =>
  api("/api/vitals", "POST", payload);

export const updateVital = (id, payload) =>
  api(`/api/vitals/${id}`, "PUT", payload);

export const deleteVital = (id) =>
  api(`/api/vitals/${id}`, "DELETE");
