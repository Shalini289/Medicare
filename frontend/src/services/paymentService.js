import { api } from "@/utils/api";

export const createPaymentOrder = (amount) =>
  api("/api/payment/create-order", "POST", { amount });

export const verifyPayment = (data) =>
  api("/api/payment/verify", "POST", data);
