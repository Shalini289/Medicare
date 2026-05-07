import { api } from "@/utils/api";

export const getMedicineReminders = () =>
  api("/api/medicine-reminders");

export const createMedicineReminder = (payload) =>
  api("/api/medicine-reminders", "POST", payload);

export const updateMedicineReminder = (id, payload) =>
  api(`/api/medicine-reminders/${id}`, "PUT", payload);

export const deleteMedicineReminder = (id) =>
  api(`/api/medicine-reminders/${id}`, "DELETE");

export const markMedicineTaken = (id) =>
  api(`/api/medicine-reminders/${id}/taken`, "PUT");
