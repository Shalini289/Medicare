import { api } from "../utils/api";
import { getToken } from "../utils/auth";

export const getMedicines = () =>
  api("/api/pharmacy");

export const getPharmacyAlerts = () =>
  api("/api/pharmacy/alerts", "GET", null, getToken());

export const getMedicineByBarcode = (barcode) =>
  api(`/api/pharmacy/barcode/${encodeURIComponent(barcode)}`);

export const createMedicine = (data) =>
  api("/api/pharmacy", "POST", data, getToken());

export const updateMedicine = (id, data) =>
  api(`/api/pharmacy/${id}`, "PUT", data, getToken());

export const deleteMedicine = (id) =>
  api(`/api/pharmacy/${id}`, "DELETE", null, getToken());

export const placeOrder = (data) =>
  api("/api/pharmacy/order", "POST", data, getToken());

export const getOrders = () =>
  api("/api/pharmacy/my-orders", "GET", null, getToken());

export const getPharmacyOrders = () =>
  api("/api/pharmacy/orders", "GET", null, getToken());

export const updatePharmacyOrderStatus = (id, status) =>
  api(`/api/pharmacy/orders/${id}/status`, "PUT", { status }, getToken());
