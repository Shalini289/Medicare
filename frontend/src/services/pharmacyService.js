import { api } from "../utils/api";
import { getToken } from "../utils/auth";

export const getMedicines = () =>
  api("/api/pharmacy");

export const getPharmacyAlerts = () =>
  api("/api/pharmacy/alerts", "GET", null, getToken());

export const getMedicineByBarcode = (barcode) =>
  api(`/api/pharmacy/barcode/${encodeURIComponent(barcode)}`);

export const placeOrder = (data) =>
  api("/api/pharmacy/order", "POST", data, getToken());

export const getOrders = () =>
  api("/api/pharmacy/my-orders", "GET", null, getToken());
