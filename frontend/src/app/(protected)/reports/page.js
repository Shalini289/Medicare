"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaDownload, FaFilePdf, FaTrash, FaUpload } from "react-icons/fa";
import {
  deleteStoredReport,
  getStoredReports,
  uploadStoredReport,
} from "@/services/storedReportService";
import { getApiUrl } from "@/utils/runtimeConfig";
import "@/styles/storedReports.css";

const emptyForm = {
  title: "",
  category: "General",
  reportDate: "",
  notes: "",
};

const formatSize = (size = 0) => {
  if (!size) return "0 KB";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) => {
  if (!date) return "No date";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "No date";
  }
};

export default function StoredReportsPage() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getStoredReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadReports();
    });
  }, [loadReports]);

  const filteredReports = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return reports;

    return reports.filter((report) =>
      [report.title, report.category, report.originalName, report.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text))
    );
  }, [query, reports]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  };

  const handleFile = (nextFile) => {
    setFile(nextFile || null);
    setError("");
    setMessage("");

    if (nextFile && !form.title) {
      setForm((current) => ({
        ...current,
        title: nextFile.name.replace(/\.pdf$/i, ""),
      }));
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Choose a PDF report first.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Report PDF must be 8MB or smaller.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const saved = await uploadStoredReport({ ...form, file });
      setReports((current) => [saved, ...current]);
      setForm(emptyForm);
      setFile(null);
      setMessage("Report PDF uploaded successfully.");
    } catch (err) {
      setError(err.message || "Could not upload report");
    } finally {
      setSaving(false);
    }
  };

  const removeReport = async (report) => {
    const confirmed = window.confirm(`Delete ${report.title || report.originalName}?`);
    if (!confirmed) return;

    setDeletingId(report._id);
    setError("");
    setMessage("");

    try {
      await deleteStoredReport(report._id);
      setReports((current) => current.filter((item) => item._id !== report._id));
      setMessage("Report deleted.");
    } catch (err) {
      setError(err.message || "Could not delete report");
    } finally {
      setDeletingId("");
    }
  };

  const baseUrl = getApiUrl() || "";

  return (
    <main className="stored-reports-page">
      <section className="stored-reports-hero">
        <div>
          <span className="eyebrow">Records vault</span>
          <h1>Reports</h1>
          <p>Upload and store your medical report PDFs in one secure place for quick access later.</p>
        </div>

        <div className="stored-report-stats">
          <span><strong>{reports.length}</strong> PDFs stored</span>
          <span><strong>{filteredReports.length}</strong> Showing</span>
        </div>
      </section>

      <section className="stored-reports-layout">
        <form className="report-upload-panel" onSubmit={submitReport}>
          <div className="report-panel-title">
            <FaUpload aria-hidden="true" />
            <h2>Upload PDF report</h2>
          </div>

          <label className="pdf-dropzone">
            <FaFilePdf aria-hidden="true" />
            <span>{file?.name || "Choose PDF report"}</span>
            <input
              accept="application/pdf,.pdf"
              type="file"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>

          <label>
            Report title
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="CBC, X-Ray, Discharge summary..."
            />
          </label>

          <div className="report-form-grid">
            <label>
              Category
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
              >
                <option>General</option>
                <option>Blood Test</option>
                <option>Imaging</option>
                <option>Prescription</option>
                <option>Discharge Summary</option>
                <option>Insurance</option>
              </select>
            </label>

            <label>
              Report date
              <input
                type="date"
                value={form.reportDate}
                onChange={(event) => updateField("reportDate", event.target.value)}
              />
            </label>
          </div>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Optional notes about this report"
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {message && <p className="report-success">{message}</p>}

          <button disabled={saving} type="submit">
            {saving ? "Uploading..." : "Store PDF report"}
          </button>
        </form>

        <section className="stored-report-list-panel">
          <div className="report-list-head">
            <div>
              <h2>Stored reports</h2>
              <p>Your PDFs are saved as files and linked to your account.</p>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports"
            />
          </div>

          {loading ? (
            <p className="empty-state">Loading reports...</p>
          ) : filteredReports.length === 0 ? (
            <p className="empty-state">No PDF reports found.</p>
          ) : (
            <div className="stored-report-list">
              {filteredReports.map((report) => {
                const fileUrl = `${baseUrl}${report.url}`;

                return (
                  <article className="stored-report-card" key={report._id}>
                    <div className="stored-report-icon">
                      <FaFilePdf aria-hidden="true" />
                    </div>

                    <div>
                      <h3>{report.title || report.originalName}</h3>
                      <p>
                        {[report.category, formatDate(report.reportDate), formatSize(report.size)]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                      {report.notes && <small>{report.notes}</small>}
                    </div>

                    <div className="stored-report-actions">
                      <a href={fileUrl} rel="noreferrer" target="_blank">
                        <FaDownload aria-hidden="true" />
                        Open
                      </a>
                      <button
                        disabled={deletingId === report._id}
                        onClick={() => removeReport(report)}
                        type="button"
                      >
                        <FaTrash aria-hidden="true" />
                        {deletingId === report._id ? "Deleting" : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
