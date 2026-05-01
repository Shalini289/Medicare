import { api } from "@/utils/api";

export const getNotifications = () =>
  api("/api/notifications");

export const markNotificationRead = (id) =>
  api(`/api/notifications/${id}/read`, "PUT");

export const clearNotifications = () =>
  api("/api/notifications", "DELETE");
