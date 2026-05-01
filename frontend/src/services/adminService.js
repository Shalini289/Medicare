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

export const getAppointmentsAdmin = () =>
  api("/api/admin/appointments", "GET", null, getToken());

export const updateAppointment = (id, data) =>
  api(`/api/admin/appointments/${id}`, "PUT", data, getToken());

export const getMedicinesAdmin = () =>
  api("/api/admin/medicines", "GET", null, getToken());

export const addMedicine = (data) =>
  api("/api/admin/medicines", "POST", data, getToken());

export const updateMedicine = (id, data) =>
  api(`/api/admin/medicines/${id}`, "PUT", data, getToken());

export const deleteMedicine = (id) =>
  api(`/api/admin/medicines/${id}`, "DELETE", null, getToken());

export const getHospitalsAdmin = () =>
  api("/api/admin/hospitals", "GET", null, getToken());

export const addHospital = (data) =>
  api("/api/admin/hospitals", "POST", data, getToken());

export const updateHospital = (id, data) =>
  api(`/api/admin/hospitals/${id}`, "PUT", data, getToken());
