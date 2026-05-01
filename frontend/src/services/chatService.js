import { api } from "@/utils/api";

export const getMessages = () =>
  api("/api/chat");

export const sendChatMessage = (message, receiver = null) =>
  api("/api/chat", "POST", { message, receiver });
