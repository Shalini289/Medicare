import { api } from "@/utils/api";

export const checkSymptoms = (symptoms) =>
  api("/api/ai/symptoms", "POST", { symptoms });
