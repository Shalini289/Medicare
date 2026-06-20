import { api } from "@/utils/api";

export const getStoredReports = () =>
  api("/api/stored-reports");

export const uploadStoredReport = (payload) => {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("title", payload.title || "");
  form.append("category", payload.category || "");
  form.append("reportDate", payload.reportDate || "");
  form.append("notes", payload.notes || "");

  return api("/api/stored-reports", {
    method: "POST",
    body: form,
  });
};

export const deleteStoredReport = (id) =>
  api(`/api/stored-reports/${id}`, "DELETE");
