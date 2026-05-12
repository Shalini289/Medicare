"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/utils/api";

export default function Reports() {
  const [file, setFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      const res = await api("/api/report");
      setReports(Array.isArray(res) ? res : []);
    } finally {
      setLoadingReports(false);
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
      [report.file, report.extractedText, String(report.analysis || "")]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(text))
    );
  }, [query, reports]);

  const upload = async () => {
    if (!file) {
      setError("Select a report file first.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Report file must be 8MB or smaller.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const uploaded = await api("/api/report/upload", "POST", form);
      setReports((prev) => [uploaded, ...prev]);
      setFile(null);
      setMessage("Report uploaded successfully.");
    } catch (err) {
      setError(err.message || "Upload failed. Please try another report file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Medical Reports</h1>
          <p>Upload reports, review extracted text, and track AI analysis.</p>
        </div>
        <button className="btn-primary" onClick={loadReports}>
          Refresh
        </button>
      </div>

      {error && <p className="report-alert error">{error}</p>}
      {message && <p className="report-alert success">{message}</p>}

      <div className="report-box">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => {
            setFile(e.target.files[0] || null);
            setError("");
            setMessage("");
          }}
        />

        {file && (
          <div className="report-file">
            <strong>{file.name}</strong>
            <span>{Math.ceil(file.size / 1024)} KB</span>
          </div>
        )}

        <button className="btn-primary" onClick={upload} disabled={loading}>
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </div>

      <div className="report-tools">
        <input
          type="search"
          placeholder="Search reports..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loadingReports && <p>Loading reports...</p>}
      {!loadingReports && filteredReports.length === 0 && <p>No reports found</p>}

      <div className="report-list">
        {filteredReports.map((report) => (
          <article key={report._id} className="report-card">
            <div className="report-card__head">
              <h3>{report.file?.split(/[\\/]/).pop() || "Medical report"}</h3>
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="report-card__section">
              <h4>AI Analysis</h4>
              <p>{typeof report.analysis === "string" ? report.analysis : JSON.stringify(report.analysis)}</p>
            </div>

            <details>
              <summary>Extracted text</summary>
              <p>{report.extractedText || "No text extracted"}</p>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
