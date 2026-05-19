"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { getToken } from "@/utils/auth";

const getReportName = (file = "") =>
  String(file || "Medical report").split(/[\\/]/).pop() || "Medical report";

const getAnalysisPreview = (analysis) => {
  const text = typeof analysis === "string"
    ? analysis
    : JSON.stringify(analysis || "");

  if (!text.trim()) return "Analysis is processing or not available yet.";

  const cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const preferred = cleaned.match(/(?:Doctor's Clinical Review|Patient Review Summary|Clinical Significance)\s*:?\s*([^]*?)(?:Key Abnormal Findings|Recommended Next Steps|Complete Blood Count|Widal Test|Disclaimer|$)/i);
  const preview = preferred?.[1]?.trim() || cleaned;

  return preview.length > 260 ? `${preview.slice(0, 260).trim()}...` : preview;
};

export default function HealthPage() {
  const token = getToken();
  const [reports, setReports] = useState([]);
  const [riskSummary, setRiskSummary] = useState({
    risks: [],
    advice: [],
    reportCount: 0,
    lastReportDate: null,
  });

  const loadData = useCallback(async () => {
    const r = await api("/api/report", "GET", null, token);
    const risk = await api("/api/risk", "GET", null, token);

    setReports(r || []);
    setRiskSummary({
      risks: risk?.risks || [],
      advice: Array.isArray(risk?.advice) ? risk.advice : [risk?.advice].filter(Boolean),
      reportCount: risk?.reportCount || 0,
      lastReportDate: risk?.lastReportDate || null,
    });
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => {
      loadData();
    });
  }, [loadData]);

  return (
    <div className="health-page">
      <h1>Health Dashboard</h1>

      <div className="card health-actions">
        <div>
          <h3>Patient Dashboard</h3>
          <p>Review alerts, upcoming care, and all modules in one place.</p>
        </div>
        <Link className="btn-primary" href="/dashboard">
          Open dashboard
        </Link>
      </div>

      <div className="card health-actions">
        <div>
          <h3>Vitals Tracker</h3>
          <p>Log BP, sugar, oxygen, temperature, pulse, and weight readings.</p>
        </div>
        <Link className="btn-primary" href="/vitals">
          Open vitals
        </Link>
      </div>

      <div className="card health-actions">
        <div>
          <h3>Medical ID</h3>
          <p>Keep allergies, emergency contacts, and care notes ready.</p>
        </div>
        <Link className="btn-primary" href="/medical-id">
          Open Medical ID
        </Link>
      </div>

      <div className="card health-actions">
        <div>
          <h3>Vaccinations</h3>
          <p>Track upcoming, completed, and overdue immunizations.</p>
        </div>
        <Link className="btn-primary" href="/vaccinations">
          Open vaccines
        </Link>
      </div>

      <div className="card">
        <h3>Risk Prediction</h3>
        <p>Reports analyzed: {riskSummary.reportCount}</p>
        {riskSummary.lastReportDate && (
          <p>Last report: {new Date(riskSummary.lastReportDate).toLocaleDateString()}</p>
        )}

        {riskSummary.risks.length === 0
          ? <p>No risks detected</p>
          : riskSummary.risks.map((r,i)=><span key={i} className="badge">{r}</span>)
        }
      </div>

      <div className="card">
        <h3>Care Advice</h3>
        <ul className="health-advice">
          {riskSummary.advice.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="health-section-head">
          <div>
            <h3>Reports</h3>
            <p>Recent report summaries from your uploaded medical records.</p>
          </div>
          <Link className="btn-secondary" href="/reports">
            View full reports
          </Link>
        </div>

        {reports.length === 0 && <p>No reports uploaded yet.</p>}

        <div className="health-report-list">
          {reports.slice(0, 3).map((rep) => (
            <article key={rep._id} className="health-report-card">
              <div>
                <h4>{getReportName(rep.file)}</h4>
                <span>{rep.createdAt ? new Date(rep.createdAt).toLocaleDateString("en-IN") : "Date not available"}</span>
              </div>
              <p>{getAnalysisPreview(rep.analysis)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
