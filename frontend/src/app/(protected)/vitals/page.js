"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaHeartbeat, FaNotesMedical, FaTrash } from "react-icons/fa";
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

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medicare-vitals.csv";
    link.click();
    URL.revokeObjectURL(url);
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
