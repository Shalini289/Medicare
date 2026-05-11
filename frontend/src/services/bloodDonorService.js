import { api } from "@/utils/api";

const paramsFromFilters = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.bloodGroup) params.set("bloodGroup", filters.bloodGroup);
  if (filters.city) params.set("city", filters.city);
  if (filters.available) params.set("available", filters.available);

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const findBloodDonors = (filters) =>
  api(`/api/blood-donors${paramsFromFilters(filters)}`);

export const getMyBloodDonorProfile = () =>
  api("/api/blood-donors/me");

export const saveMyBloodDonorProfile = (payload) =>
  api("/api/blood-donors/me", "PUT", payload);

export const deleteMyBloodDonorProfile = () =>
  api("/api/blood-donors/me", "DELETE");

export const requestBloodDonor = (id) =>
  api(`/api/blood-donors/${id}/request`, "POST");
