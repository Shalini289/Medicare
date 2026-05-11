import { api } from "@/utils/api";

export const getPrescriptions = () =>
  api("/api/prescriptions");
