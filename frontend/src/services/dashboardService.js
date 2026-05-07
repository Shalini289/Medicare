import { api } from "@/utils/api";

export const getDashboard = () =>
  api("/api/dashboard");
