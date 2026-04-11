import { api } from "../utils/api";
import { getToken } from "../utils/auth";

export const getDashboardStats = () =>
  api("/api/admin/stats", "GET", null, getToken());

export const getDoctorsAdmin = () =>
  api("/api/admin/doctors", "GET", null, getToken());

export const addDoctor = (data) =>
  api("/api/admin/doctors", "POST", data, getToken());

export const deleteDoctor = (id) =>
  api(`/api/admin/doctors/${id}`, "DELETE", null, getToken());

export const getOrdersAdmin = () =>
  api("/api/admin/orders", "GET", null, getToken());

export const updateOrder = (id, data) =>
  api(`/api/admin/orders/${id}`, "PUT", data, getToken());

export const updateDoctor = (id, data) =>
  api(`/api/admin/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });