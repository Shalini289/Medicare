import { api } from "@/utils/api";

export const getMedicalProfile = () =>
  api("/api/medical-profile");

export const saveMedicalProfile = (payload) =>
  api("/api/medical-profile", "PUT", payload);

export const getEmergencyContacts = () =>
  api("/api/medical-profile/emergency-contacts");

export const saveEmergencyContacts = (contacts) =>
  api("/api/medical-profile/emergency-contacts", "PUT", { contacts });

export const sendEmergencyAlert = (payload = {}) =>
  api("/api/medical-profile/emergency-alert", "POST", payload);
