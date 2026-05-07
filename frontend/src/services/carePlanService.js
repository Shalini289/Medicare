import { api } from "@/utils/api";

export const getCarePlans = () =>
  api("/api/care-plans");

export const createCarePlan = (payload) =>
  api("/api/care-plans", "POST", payload);

export const updateCarePlan = (id, payload) =>
  api(`/api/care-plans/${id}`, "PUT", payload);

export const toggleCareTask = (planId, taskId) =>
  api(`/api/care-plans/${planId}/tasks/${taskId}/toggle`, "PUT");

export const deleteCarePlan = (id) =>
  api(`/api/care-plans/${id}`, "DELETE");
