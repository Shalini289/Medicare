"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFilePdf, FaHeartbeat, FaNotesMedical, FaTrash } from "react-icons/fa";
import {
  createVital,
  deleteVital,
  getVitals,
} from "@/services/vitalService";
import "@/styles/vitals.css";

const blankForm = {
  recordedAt: new Date().toISOString().slice(0, 16),
  systolic: "",
  diastolic: "",
  pulse: "",
  oxygen: "",
  temperature: "",
  bloodSugar: "",
  weight: "",
  notes: "",
};

const metricCards = [
  { key: "bp", label: "Blood pressure", unit: "mmHg" },
  { key: "pulse", label: "Pulse", unit: "bpm" },
  { key: "oxygen", label: "Oxygen", unit: "%" },
  { key: "temperature", label: "Temperature", unit: "F" },
  { key: "bloodSugar", label: "Blood sugar", unit: "mg/dL" },
  { key: "weight", label: "Weight", unit: "kg" },
];

const formatValue = (record, key) => {
  if (!record) return "--";
  if (key === "bp") {
    return record.systolic && record.diastolic
      ? `${record.systolic}/${record.diastolic}`
      : "--";
  }

  return record[key] ?? "--";
};

const sanitizePdfText = (value) =>
  String(value ?? "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapePdfText = (value) =>
  sanitizePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrapPdfText = (text, maxLength = 88) => {
  const words = sanitizePdfText(text).split(" ").filter(Boolean);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    if (`${line} ${word}`.trim().length > maxLength) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const buildVitalsPdf = (records, summary) => {
  const lineHeight = 18;
  const top = 780;
  const left = 42;
  const maxLinesPerPage = 38;
  const latest = summary?.latest;
  const reportLines = [
    { text: "MediCare Vitals Report", size: 18 },
    { text: `Generated: ${new Date().toLocaleString()}`, size: 10 },
    { text: `Total readings: ${records.length}`, size: 10 },
    { text: "", size: 10 },
    { text: "Latest Summary", size: 14 },
    {
      text: latest
        ? `BP ${formatValue(latest, "bp")} mmHg | Pulse ${latest.pulse || "--"} bpm | Oxygen ${latest.oxygen || "--"}% | Temp ${latest.temperature || "--"} F | Sugar ${latest.bloodSugar || "--"} mg/dL | Weight ${latest.weight || "--"} kg`
        : "No latest summary available.",
      size: 10,
    },
    ...(summary?.alerts?.length
      ? [
          { text: "Alerts", size: 14 },
          ...summary.alerts.flatMap((alert) =>
            wrapPdfText(`- ${alert}`, 86).map((text) => ({ text, size: 10 }))
          ),
          ...wrapPdfText(summary.advice || "", 86).map((text) => ({ text, size: 10 })),
        ]
      : []),
    { text: "", size: 10 },
    { text: "Recent Readings", size: 14 },
    ...records.flatMap((record, index) => {
      const row = `${index + 1}. ${new Date(record.recordedAt).toLocaleString()} | BP ${formatValue(record, "bp")} | Pulse ${record.pulse || "--"} | SpO2 ${record.oxygen || "--"}% | Temp ${record.temperature || "--"} F | Sugar ${record.bloodSugar || "--"} | Weight ${record.weight || "--"} kg`;
      const notes = record.notes ? `Notes: ${record.notes}` : "";
      return [
        ...wrapPdfText(row, 86).map((text) => ({ text, size: 10 })),
        ...wrapPdfText(notes, 86).filter(Boolean).map((text) => ({ text, size: 9 })),
        { text: "", size: 8 },
      ];
    }),
  ];

  const pages = [];
  for (let index = 0; index < reportLines.length; index += maxLinesPerPage) {
    pages.push(reportLines.slice(index, index + maxLinesPerPage));
  }

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  ];

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectId = 3 + pageIndex * 2;
    const contentObjectId = pageObjectId + 1;
    const commands = pageLines
      .map((line, lineIndex) => {
        const y = top - lineIndex * lineHeight;
        return `BT /F1 ${line.size || 10} Tf ${left} ${y} Td (${escapePdfText(line.text)}) Tj ET`;
      })
      .join("\n");

    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectId} 0 R >>`);
    objects.push(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

export default function VitalsPage() {
  const [form, setForm] = useState(blankForm);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadVitals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getVitals();
      setRecords(Array.isArray(data.records) ? data.records : []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.message || "Could not load vitals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadVitals();
    });
  }, [loadVitals]);

  const trendRecords = useMemo(() => records.slice(0, 7).reverse(), [records]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveVital = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createVital(form);
      setForm(blankForm);
      await loadVitals();
    } catch (err) {
      setError(err.message || "Could not save reading");
    } finally {
      setSaving(false);
    }
  };

  const removeVital = async (id) => {
    await deleteVital(id);
    await loadVitals();
  };

  const exportCsv = () => {
    const header = [
      "Recorded At",
      "Systolic",
      "Diastolic",
      "Pulse",
      "Oxygen",
      "Temperature",
      "Blood Sugar",
      "Weight",
      "Notes",
    ];
    const rows = records.map((record) => [
      new Date(record.recordedAt).toLocaleString(),
      record.systolic || "",
      record.diastolic || "",
      record.pulse || "",
      record.oxygen || "",
      record.temperature || "",
      record.bloodSugar || "",
      record.weight || "",
      record.notes || "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "medicare-vitals.csv");
  };

  const exportPdf = () => {
    downloadBlob(buildVitalsPdf(records, summary), "medicare-vitals-report.pdf");
  };

  return (
    <main className="vitals-page">
      <section className="vitals-hero">
        <div>
          <span className="eyebrow">Daily monitoring</span>
          <h1>Vitals Tracker</h1>
          <p>Record key health readings and spot changes before your next consultation.</p>
        </div>

        <div className="vitals-actions">
          <button className="btn-primary" onClick={exportPdf} disabled={records.length === 0}>
            <FaFilePdf aria-hidden="true" />
            Download PDF
          </button>
          <button className="btn-secondary" onClick={exportCsv} disabled={records.length === 0}>
            Export CSV
          </button>
        </div>
      </section>

      <section className="vital-summary">
        {metricCards.map((metric) => (
          <article className="vital-stat" key={metric.key}>
            <span>{metric.label}</span>
            <strong>{formatValue(summary?.latest, metric.key)}</strong>
            <small>{metric.unit}</small>
          </article>
        ))}
      </section>

      {summary?.alerts?.length > 0 && (
        <section className="vitals-alerts">
          <FaHeartbeat aria-hidden="true" />
          <div>
            <h2>Attention needed</h2>
            <p>{summary.advice}</p>
            <div>
              {summary.alerts.map((alert) => (
                <span key={alert}>{alert}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="vitals-layout">
        <form className="vital-form" onSubmit={saveVital}>
          <div className="form-title">
            <FaNotesMedical aria-hidden="true" />
            <h2>Add reading</h2>
          </div>

          {error && <p className="form-error">{error}</p>}

          <label>
            Recorded at
            <input
              type="datetime-local"
              name="recordedAt"
              value={form.recordedAt}
              onChange={handleChange}
            />
          </label>

          <div className="form-grid">
            <label>
              Systolic
              <input name="systolic" type="number" value={form.systolic} onChange={handleChange} placeholder="120" />
            </label>
            <label>
              Diastolic
              <input name="diastolic" type="number" value={form.diastolic} onChange={handleChange} placeholder="80" />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Pulse
              <input name="pulse" type="number" value={form.pulse} onChange={handleChange} placeholder="72" />
            </label>
            <label>
              Oxygen
              <input name="oxygen" type="number" value={form.oxygen} onChange={handleChange} placeholder="98" />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Temperature
              <input name="temperature" type="number" step="0.1" value={form.temperature} onChange={handleChange} placeholder="98.6" />
            </label>
            <label>
              Blood sugar
              <input name="bloodSugar" type="number" value={form.bloodSugar} onChange={handleChange} placeholder="110" />
            </label>
          </div>

          <label>
            Weight
            <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} placeholder="65" />
          </label>

          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="After walk, before breakfast" rows="3" />
          </label>

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save reading"}
          </button>
        </form>

        <div className="vitals-panel">
          <div className="vitals-panel__head">
            <div>
              <h2>Recent readings</h2>
              <p>{summary?.count || 0} records saved</p>
            </div>
          </div>

          <div className="trend-strip">
            {trendRecords.map((record) => {
              const height = Math.min(100, Math.max(18, Number(record.pulse || 60)));
              return (
                <div key={record._id} title={new Date(record.recordedAt).toLocaleString()}>
                  <span style={{ height: `${height}%` }} />
                  <small>{record.pulse || "--"}</small>
                </div>
              );
            })}
            {trendRecords.length === 0 && <p className="empty-state">No trend data yet.</p>}
          </div>

          {loading ? (
            <p className="empty-state">Loading readings...</p>
          ) : records.length === 0 ? (
            <p className="empty-state">No readings yet.</p>
          ) : (
            <div className="vital-records">
              {records.map((record) => (
                <article className="vital-record" key={record._id}>
                  <div>
                    <strong>{new Date(record.recordedAt).toLocaleString()}</strong>
                    <p>
                      BP {formatValue(record, "bp")} | Pulse {record.pulse || "--"} | SpO2 {record.oxygen || "--"}%
                    </p>
                    <small>
                      Temp {record.temperature || "--"} F | Sugar {record.bloodSugar || "--"} | Weight {record.weight || "--"} kg
                    </small>
                    {record.notes && <em>{record.notes}</em>}
                  </div>
                  <button title="Delete reading" onClick={() => removeVital(record._id)}>
                    <FaTrash aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
