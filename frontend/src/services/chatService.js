import { api } from "@/utils/api";

export const getMessages = (doctor = null) => {
  const params = doctor ? `?doctor=${encodeURIComponent(doctor)}` : "";
  return api(`/api/chat${params}`);
};

export const sendChatMessage = ({ message, receiver = null, doctor = null }) =>
  api("/api/chat", "POST", { message, receiver, doctor });
