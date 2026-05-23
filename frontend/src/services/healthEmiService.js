import { api } from "@/utils/api";

export const predictHealthEmi = (payload) =>
  api("/api/health-emi/predict", "POST", payload);
