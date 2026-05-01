"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import { getToken } from "../../utils/auth";
import "../globals.css";

const commonSymptoms = [
  "Fever",
  "Cough",
  "Headache",
  "Nausea",
  "Chest pain",
  "Fatigue",
  "Sore throat",
  "Shortness of breath",
];

export default function SymptomPage() {
  const token = getToken();

  const [input, setInput] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem("symptomHistory");
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved);
        setHistory(Array.isArray(parsed) ? parsed : []);
      } catch {
        localStorage.removeItem("symptomHistory");
      }
    });
  }, []);

  const composedSymptoms = useMemo(() => {
    return [
      input.trim(),
      duration ? `Duration: ${duration}` : "",
      severity ? `Severity: ${severity}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [duration, input, severity]);

  const addSymptom = (symptom) => {
    setInput((current) => {
      const parts = current.split(",").map((item) => item.trim().toLowerCase());
      return parts.includes(symptom.toLowerCase())
        ? current
        : current ? `${current}, ${symptom}` : symptom;
    });
  };

  const saveHistory = (entry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 5);
      localStorage.setItem("symptomHistory", JSON.stringify(next));
      return next;
    });
  };

  const checkSymptoms = async () => {
    if (!input.trim()) return alert("Enter symptoms");

    try {
      setLoading(true);

      const res = await api("/api/ai/symptoms", "POST", { symptoms: composedSymptoms }, token);
      const nextResult = {
        conditions: res?.conditions || [],
        urgency: res?.urgency || "routine",
        advice: res?.advice || [],
        nextSteps: res?.nextSteps || [],
        summary: res?.summary || "",
      };

      setResult(nextResult);
      saveHistory({
        id: Date.now(),
        symptoms: input,
        duration,
        severity,
        result: nextResult,
      });
    } catch {
      alert("Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="symptom-page">
      <h1>AI Symptom Checker</h1>
      <p>Describe symptoms, severity, and duration to get care guidance.</p>

      <div className="symptom-chips">
        {commonSymptoms.map((symptom) => (
          <button key={symptom} onClick={() => addSymptom(symptom)}>
            {symptom}
          </button>
        ))}
      </div>

      <textarea
        placeholder="e.g. fever, headache, cough..."
        value={input}
        onChange={(e)=>setInput(e.target.value)}
      />

      <div className="symptom-controls">
        <input
          placeholder="Duration, e.g. 2 days"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
      </div>

      <button className="btn-primary" onClick={checkSymptoms} disabled={loading}>
        {loading ? "Analyzing..." : "Check Symptoms"}
      </button>

      <div className="symptom-results">
        {!result && !loading && (
          <p>No results yet</p>
        )}

        {result && (
          <div className={`symptom-result symptom-result--${result.urgency}`}>
            <div className="symptom-result__head">
              <h3>Care Guidance</h3>
              <span>{result.urgency}</span>
            </div>

            {result.summary && <p>{result.summary}</p>}

            <h4>Possible Conditions</h4>
            {result.conditions.map((condition, i) => (
              <div key={i} className="symptom-card">
                <p>{condition}</p>
              </div>
            ))}

            <h4>Advice</h4>
            <ul>
              {result.advice.map((item, i) => <li key={i}>{item}</li>)}
            </ul>

            <h4>Next Steps</h4>
            <ul>
              {result.nextSteps.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="symptom-history">
          <h3>Recent Checks</h3>
          {history.map((entry) => (
            <button key={entry.id} onClick={() => setResult(entry.result)}>
              <strong>{entry.symptoms}</strong>
              <span>{entry.severity} {entry.duration}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
