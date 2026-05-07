import { api } from "@/utils/api";

export const getVaccinations = () =>
  api("/api/vaccinations");

export const createVaccination = (payload) =>
  api("/api/vaccinations", "POST", payload);

export const updateVaccination = (id, payload) =>
  api(`/api/vaccinations/${id}`, "PUT", payload);

export const completeVaccination = (id, payload = {}) =>
  api(`/api/vaccinations/${id}/complete`, "PUT", payload);

export const deleteVaccination = (id) =>
  api(`/api/vaccinations/${id}`, "DELETE");
