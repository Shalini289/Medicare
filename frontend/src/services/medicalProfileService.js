import { api } from "@/utils/api";

export const getMedicalProfile = () =>
  api("/api/medical-profile");

export const saveMedicalProfile = (payload) =>
  api("/api/medical-profile", "PUT", payload);
