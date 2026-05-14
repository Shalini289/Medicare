"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { api } from "@/utils/api";

const detailLabels = [
  "Patient Name",
  "Patient ID",
  "Client Name",
  "Age / Gender",
  "Ref. By",
  "Registered On",
  "Reported On",
  "Collected On",
  "Report Status",
  "Sample Type",
  "To Validate",
];

const testMarkers = [
  "HEMOGLOBIN",
  "Red Blood Cell Count",
  "Hematocrit",
  "Mean Corpuscular Volume",
  "Mean Corpuscular Hemoglobin",
  "MCHC",
  "RDW",
  "TOTAL COUNT",
  "Differential Leucocyte Count",
  "Neutrophils",
  "Lymphocytes",
  "Monocytes",
  "Eosinophils",
  "Basophils",
  "Absolute Leucocyte Count",
  "PLATELET COUNT",
  "Mean Platelet Volume",
  "Platelet Distribution Width",
  "Plateletcrit",
  "Salmonella Typhi",
  "Slide agglutination",
];

const normalizeExtractedText = (text = "") => {
  if (!text.trim()) return [];

  let cleaned = text
    .replace(/\r/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/-{3,}\s*END OF REPORT\s*-{3,}/gi, "\nEND OF REPORT\n")
    .replace(/Page\s+\d+\s+of\s+\d+/gi, "\n$&\n")
    .trim();

  [...detailLabels, ...testMarkers].forEach((label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`\\s+(${escaped})`, "gi"), "\n$1");
  });

  cleaned = cleaned.replace(/\s+(Parameter Name Unit Reference Range Value)\s+/gi, "\n$1\n");

  return cleaned
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
};

const getLineType = (line) => {
  if (/^(Patient|Client|Age|Ref\.|Registered|Reported|Collected|Report|Sample|To Validate)/i.test(line)) {
    return "detail";
  }

  if (/^(END OF REPORT|Page\s+\d+)/i.test(line)) {
    return "meta";
  }

  if (/Reference Range Value|g\/dL|mill\/mm3|\/cmm|%|fL|Pg|10\^3\/uL|antigen/i.test(line)) {
    return "result";
  }

  return "note";
};

function OrganizedExtractedText({ text }) {
  const lines = normalizeExtractedText(text);

  if (lines.length === 0) {
    return <p className="empty-state">No text extracted</p>;
  }

  const grouped = lines.reduce(
    (acc, line) => {
      acc[getLineType(line)].push(line);
      return acc;
    },
    { detail: [], result: [], note: [], meta: [] }
  );

  return (
    <div className="extracted-text">
      {grouped.detail.length > 0 && (
        <section className="extracted-section">
          <h5>Report details</h5>
          <div className="extracted-detail-grid">
            {grouped.detail.map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
          </div>
        </section>
      )}

      {grouped.result.length > 0 && (
        <section className="extracted-section">
          <h5>Detected results</h5>
          <div className="extracted-result-list">
            {grouped.result.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </section>
      )}

      {grouped.note.length > 0 && (
        <section className="extracted-section">
          <h5>Other text</h5>
          <div className="extracted-result-list">
            {grouped.note.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </section>
      )}

      {grouped.meta.length > 0 && (
        <div className="extracted-meta">
          {grouped.meta.map((line, index) => (
            <span key={`${line}-${index}`}>{line}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const normalizeAnalysisText = (analysis) => {
  const raw = typeof analysis === "string" ? analysis : JSON.stringify(analysis || "");

  return raw
    .replace(/\r/g, "\n")
    .replace(/\*\*/g, "")
    .replace(/\s+\*/g, "\n*")
    .replace(/\s+\+/g, "\n+")
    .replace(/\s+(\d+\.)\s+/g, "\n$1 ")
    .replace(/The key findings from this lab report are:/i, "\nKey findings:")
    .replace(/Based on the lab report provided, here are the key findings:/i, "\nKey findings:")
    .replace(/\s+/g, " ")
    .replace(/\s?(\n[*+\d])/g, "$1")
    .trim();
};

const getAnalysisLineType = (line) => {
  if (/^Key findings:?$/i.test(line) || /count|test|examination|smears/i.test(line)) {
    return "section";
  }

  if (/^\d+\./.test(line)) {
    return "numbered";
  }

  if (/^[*+]\s*/.test(line)) {
    return "bullet";
  }

  return "paragraph";
};

function OrganizedAnalysis({ analysis }) {
  const text = normalizeAnalysisText(analysis);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return <p>No AI analysis available.</p>;
  }

  return (
    <div className="analysis-text">
      {lines.map((line, index) => {
        const type = getAnalysisLineType(line);
        const cleaned = line.replace(/^[*+]\s*/, "");

        if (type === "section") {
          return <h5 key={`${line}-${index}`}>{cleaned}</h5>;
        }

        if (type === "numbered") {
          return <p className="analysis-numbered" key={`${line}-${index}`}>{cleaned}</p>;
        }

        if (type === "bullet") {
          return <p className="analysis-bullet" key={`${line}-${index}`}>{cleaned}</p>;
        }

        return <p key={`${line}-${index}`}>{cleaned}</p>;
      })}
    </div>
  );
}

export default function Reports() {
  const [file, setFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [deletingId, setDeletingId] = useState("");
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

  const deleteReport = async (report) => {
    const fileName = report.file?.split(/[\\/]/).pop() || "this report";

    if (!confirm(`Delete ${fileName}?`)) return;

    try {
      setDeletingId(report._id);
      setError("");
      setMessage("");
      await api(`/api/report/${report._id}`, "DELETE");
      setReports((current) => current.filter((item) => item._id !== report._id));
      setMessage("Report deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete report.");
    } finally {
      setDeletingId("");
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
              <div>
                <h3>{report.file?.split(/[\\/]/).pop() || "Medical report"}</h3>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                className="report-delete-btn"
                type="button"
                onClick={() => deleteReport(report)}
                disabled={deletingId === report._id}
                title="Delete report"
              >
                <FaTrash aria-hidden="true" />
                {deletingId === report._id ? "Deleting..." : "Delete"}
              </button>
            </div>

            <div className="report-card__section">
              <h4>AI Analysis</h4>
              <OrganizedAnalysis analysis={report.analysis} />
            </div>

            <details>
              <summary>Extracted text</summary>
              <OrganizedExtractedText text={report.extractedText} />
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
