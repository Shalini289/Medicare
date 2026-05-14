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

const analysisSections = [
  "Patient Review Summary",
  "Complete Blood Count (CBC) Highlights",
  "Widal Test",
  "Interpretation",
  "Liver Function Tests (SGOT(AST) and SGPT(ALT))",
  "Malaria Parasite Smear Test",
  "Urine Routine Examination",
  "Chemical Examination (by Reflectance Photometric Method)",
  "Microscopic Examination (Manual by Microscopy)",
];

const analysisTestGroups = {
  cbc: [
    "HEMOGLOBIN",
    "Red Blood Cell Count",
    "Hematocrit",
    "Mean Corpuscular Volume (MCV)",
    "Total COUNT (WBC)",
    "Neutrophils (%)",
    "Lymphocytes (%)",
    "Neutrophils (Abs)",
    "Lymphocytes (Abs)",
    "Platelet Count",
    "Mean Platelet Volume (MPV)",
  ],
  liver: ["SGOT(AST) value", "SGPT(ALT) value"],
  urine: ["Quantity", "Colour", "Appearance", "pH", "Sp. Gravity", "Protein", "Glucose"],
  microscopy: ["Erythrocytes (Red Cells)", "Leucocytes (Pus Cells)", "Epithelial Cells", "Bacteria"],
};

const patientDetailFields = [
  "Patient Name",
  "Patient ID",
  "Client Name",
  "Age / Gender",
  "Registration Details",
  "Registered On",
  "Collected On",
  "Reported On",
  "Report Status",
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeAnalysisText = (analysis) => {
  const raw = typeof analysis === "string" ? analysis : JSON.stringify(analysis || "");

  return raw
    .replace(/\r/g, " ")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getSectionText = (text, sectionName) => {
  const startMatch = text.match(new RegExp(`${escapeRegExp(sectionName)}\\s*:?`, "i"));
  if (!startMatch) return "";

  const start = startMatch.index + startMatch[0].length;
  const nextStarts = analysisSections
    .filter((name) => name !== sectionName)
    .map((name) => {
      const match = text.slice(start).match(new RegExp(`${escapeRegExp(name)}\\s*:?`, "i"));
      return match ? start + match.index : -1;
    })
    .filter((index) => index >= start);

  const end = nextStarts.length ? Math.min(...nextStarts) : text.length;
  return text.slice(start, end).replace(/^-\s*/, "").trim();
};

const extractLabeledValues = (text, labels) => {
  const matches = labels
    .map((label) => {
      const match = text.match(new RegExp(`${escapeRegExp(label)}\\s*:`, "i"));
      return match ? { label, index: match.index, end: match.index + match[0].length } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  return matches
    .map((match, index) => {
      const next = matches[index + 1]?.index ?? text.length;
      const value = text
        .slice(match.end, next)
        .replace(/^-\s*/, "")
        .replace(/\s+-\s*$/, "")
        .trim();

      return value ? { label: match.label, value } : null;
    })
    .filter(Boolean);
};

const splitReference = (value) => {
  const referenceMatch = value.match(/\(Reference range:\s*([^)]+)\)/i);
  const result = value.replace(/\(Reference range:\s*[^)]+\)/i, "").trim();

  return {
    result: result.replace(/^-\s*/, "") || "-",
    reference: referenceMatch?.[1]?.trim() || "-",
  };
};

const getStatusClass = ({ label, result, reference }) => {
  const normalized = `${label} ${result}`.toLowerCase();

  if (
    normalized.includes("positive") ||
    normalized.includes("present") ||
    normalized.includes("turbid") ||
    normalized.includes("14-16") ||
    normalized.includes("6-8") ||
    normalized.includes("5-6") ||
    /hemoglobin|hematocrit|platelet/.test(normalized)
  ) {
    return "is-attention";
  }

  if (reference !== "-" || /absent|not detected|clear|normal/i.test(result)) {
    return "is-normal";
  }

  return "";
};

const buildTestRows = (sectionText, labels) =>
  extractLabeledValues(sectionText, labels).map(({ label, value }) => {
    const split = splitReference(value);
    return {
      label,
      ...split,
      status: getStatusClass({ label, ...split }),
    };
  });

const buildWidalRows = (text) => {
  const widalText = getSectionText(text, "Widal Test");
  if (!widalText) return [];

  const rows = [];
  const oMatch = widalText.match(/Salmonella Typhi\s+"O"[^:]*antigen\s*\(([^)]+)\)/i);
  const hMatch = widalText.match(/"H"\s*antigen\s*\(([^)]+)\)/i);

  if (oMatch) rows.push({ label: 'Salmonella Typhi "O" antigen', result: `Positive (${oMatch[1]})`, reference: "-", status: "is-attention" });
  if (hMatch) rows.push({ label: 'Salmonella Typhi "H" antigen', result: `Positive (${hMatch[1]})`, reference: "-", status: "is-attention" });

  return rows;
};

const buildAnalysisData = (analysis) => {
  const text = normalizeAnalysisText(analysis);
  const patientText = getSectionText(text, "Patient Review Summary") || text;
  const cbcText = getSectionText(text, "Complete Blood Count (CBC) Highlights");
  const liverText = getSectionText(text, "Liver Function Tests (SGOT(AST) and SGPT(ALT))");
  const malariaText = getSectionText(text, "Malaria Parasite Smear Test");
  const urineText = `${getSectionText(text, "Urine Routine Examination")} ${getSectionText(text, "Chemical Examination (by Reflectance Photometric Method)")}`;
  const microscopyText = getSectionText(text, "Microscopic Examination (Manual by Microscopy)");

  return {
    text,
    patientDetails: extractLabeledValues(patientText, patientDetailFields),
    cbcRows: buildTestRows(cbcText, analysisTestGroups.cbc),
    widalRows: buildWidalRows(text),
    interpretation: getSectionText(text, "Interpretation"),
    liverRows: buildTestRows(liverText, analysisTestGroups.liver),
    malaria: malariaText,
    urineRows: buildTestRows(urineText, analysisTestGroups.urine),
    microscopyRows: buildTestRows(microscopyText, analysisTestGroups.microscopy),
  };
};

function AnalysisTable({ rows }) {
  if (!rows.length) return null;

  return (
    <div className="analysis-table-wrap">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Result</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={row.status}>
              <td>{row.label}</td>
              <td>{row.result}</td>
              <td>{row.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrganizedAnalysis({ analysis }) {
  const data = buildAnalysisData(analysis);

  if (!data.text) {
    return <p>No AI analysis available.</p>;
  }

  return (
    <div className="analysis-text">
      {data.patientDetails.length > 0 && (
        <section className="analysis-section">
          <h5>Patient details</h5>
          <div className="analysis-detail-grid">
            {data.patientDetails.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="analysis-section">
        <h5>Complete Blood Count (CBC)</h5>
        <AnalysisTable rows={data.cbcRows} />
      </section>

      {data.widalRows.length > 0 && (
        <section className="analysis-section">
          <h5>Widal test</h5>
          <AnalysisTable rows={data.widalRows} />
          {data.interpretation && <p className="analysis-note">{data.interpretation}</p>}
        </section>
      )}

      {data.liverRows.length > 0 && (
        <section className="analysis-section">
          <h5>Liver function tests</h5>
          <AnalysisTable rows={data.liverRows} />
        </section>
      )}

      {data.malaria && (
        <section className="analysis-section">
          <h5>Malaria parasite smear</h5>
          <p className="analysis-note">{data.malaria}</p>
        </section>
      )}

      {data.urineRows.length > 0 && (
        <section className="analysis-section">
          <h5>Urine routine and chemical examination</h5>
          <AnalysisTable rows={data.urineRows} />
        </section>
      )}

      {data.microscopyRows.length > 0 && (
        <section className="analysis-section">
          <h5>Microscopic examination</h5>
          <AnalysisTable rows={data.microscopyRows} />
        </section>
      )}
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
