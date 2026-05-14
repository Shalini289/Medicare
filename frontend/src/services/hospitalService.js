import { api } from "@/utils/api";

export const getHospitalPortalDashboard = () =>
  api("/api/hospital/portal");

export const updateHospitalPortal = (payload) =>
  api("/api/hospital/portal", "PUT", payload);
