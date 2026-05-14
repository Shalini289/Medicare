import { api } from "../utils/api";
import { getToken } from "../utils/auth";

export const getDashboardStats = () =>
  api("/api/admin/stats", "GET", null, getToken());

export const getAdminRecords = () =>
  api("/api/admin/records", "GET", null, getToken());

export const getUsersAdmin = () =>
  api("/api/admin/users", "GET", null, getToken());

export const deleteUserAdmin = (id) =>
  api(`/api/admin/users/${id}`, "DELETE", null, getToken());

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
  api(`/api/admin/doctors/${id}`, "PUT", data, getToken());

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

export const getStaffAdmin = () =>
  api("/api/admin/staff", "GET", null, getToken());

export const addStaff = (data) =>
  api("/api/admin/staff", "POST", data, getToken());

export const updateStaff = (id, data) =>
  api(`/api/admin/staff/${id}`, "PUT", data, getToken());

export const deleteStaff = (id) =>
  api(`/api/admin/staff/${id}`, "DELETE", null, getToken());

export const getInvoicesAdmin = () =>
  api("/api/admin/invoices", "GET", null, getToken());

export const addInvoice = (data) =>
  api("/api/admin/invoices", "POST", data, getToken());

export const updateInvoice = (id, data) =>
  api(`/api/admin/invoices/${id}`, "PUT", data, getToken());

export const deleteInvoice = (id) =>
  api(`/api/admin/invoices/${id}`, "DELETE", null, getToken());

export const getInsuranceClaimsAdmin = () =>
  api("/api/admin/insurance-claims", "GET", null, getToken());

export const addInsuranceClaim = (data) =>
  api("/api/admin/insurance-claims", "POST", data, getToken());

export const updateInsuranceClaim = (id, data) =>
  api(`/api/admin/insurance-claims/${id}`, "PUT", data, getToken());

export const deleteInsuranceClaim = (id) =>
  api(`/api/admin/insurance-claims/${id}`, "DELETE", null, getToken());

export const getAmbulancesAdmin = () =>
  api("/api/admin/ambulances", "GET", null, getToken());

export const addAmbulance = (data) =>
  api("/api/admin/ambulances", "POST", data, getToken());

export const updateAmbulance = (id, data) =>
  api(`/api/admin/ambulances/${id}`, "PUT", data, getToken());

export const deleteAmbulance = (id) =>
  api(`/api/admin/ambulances/${id}`, "DELETE", null, getToken());

export const getDepartmentsAdmin = () =>
  api("/api/admin/departments", "GET", null, getToken());

export const addDepartment = (data) =>
  api("/api/admin/departments", "POST", data, getToken());

export const updateDepartment = (id, data) =>
  api(`/api/admin/departments/${id}`, "PUT", data, getToken());

export const deleteDepartment = (id) =>
  api(`/api/admin/departments/${id}`, "DELETE", null, getToken());
