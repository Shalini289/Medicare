"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { getToken } from "@/utils/auth";

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
        <h3>Reports</h3>

        {reports.map(rep => (
          <div key={rep._id} className="report">
            <p>{rep.file}</p>
            <small>{typeof rep.analysis === "string" ? rep.analysis : JSON.stringify(rep.analysis) || "Processing..."}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
