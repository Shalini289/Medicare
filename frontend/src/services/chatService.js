import { api } from "@/utils/api";

export const getChatThreads = () => api("/api/chat/threads");

export const getMessages = ({ doctor = null, patient = null } = {}) => {
  const params = new URLSearchParams();

  if (doctor) params.set("doctor", doctor);
  if (patient) params.set("patient", patient);

  const query = params.toString() ? `?${params.toString()}` : "";
  return api(`/api/chat${query}`);
};

export const sendChatMessage = ({ message, receiver = null, doctor = null }) =>
  api("/api/chat", "POST", { message, receiver, doctor });
