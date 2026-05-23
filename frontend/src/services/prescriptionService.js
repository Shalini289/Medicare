import { api } from "@/utils/api";

export const getPrescriptions = () =>
  api("/api/prescriptions");

export const analyzePrescription = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api("/api/prescriptions/analyze", {
    method: "POST",
    body: formData,
  });
};
