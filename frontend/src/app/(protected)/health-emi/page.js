"use client";

import { useMemo, useState } from "react";
import { FaChartLine, FaFileInvoiceDollar, FaRupeeSign, FaShieldAlt } from "react-icons/fa";
import { predictHealthEmi } from "@/services/healthEmiService";
import "@/styles/healthEmi.css";

const initialForm = {
  monthlyIncome: "",
  monthlyExpenses: "",
  existingEmi: "",
  requestedAmount: "",
  creditScore: "",
  employmentType: "salaried",
};

const riskCopy = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export default function HealthEmiPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scoreStyle = useMemo(() => ({
    "--score": `${result?.score || 0}%`,
  }), [result?.score]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await predictHealthEmi({
        ...form,
        monthlyIncome: Number(form.monthlyIncome),
        monthlyExpenses: Number(form.monthlyExpenses || 0),
        existingEmi: Number(form.existingEmi || 0),
        requestedAmount: Number(form.requestedAmount),
        creditScore: Number(form.creditScore || 0),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not predict EMI eligibility");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="health-emi-page">
      <section className="health-emi-hero">
        <div>
          <span className="eyebrow">Healthcare finance support</span>
          <h1>Health EMI Eligibility Predictor</h1>
          <p>
            Estimate whether a patient can manage treatment EMI, compare repayment plans,
            and prepare a clean finance discussion before payment.
          </p>
        </div>

        <div className="health-emi-hero-card">
          <FaFileInvoiceDollar aria-hidden="true" />
          <strong>{result?.decision || "Ready to check"}</strong>
          <span>{result ? riskCopy[result.riskLevel] : "Enter care cost and income details"}</span>
        </div>
      </section>

      <section className="health-emi-layout">
        <form className="health-emi-form" onSubmit={handleSubmit}>
          <h2>Eligibility inputs</h2>

          <div className="health-emi-grid">
            <label>
              Monthly income
              <input
                min="0"
                onChange={(event) => updateField("monthlyIncome", event.target.value)}
                placeholder="45000"
                required
                type="number"
                value={form.monthlyIncome}
              />
            </label>

            <label>
              Monthly expenses
              <input
                min="0"
                onChange={(event) => updateField("monthlyExpenses", event.target.value)}
                placeholder="18000"
                type="number"
                value={form.monthlyExpenses}
              />
            </label>

            <label>
              Existing EMI
              <input
                min="0"
                onChange={(event) => updateField("existingEmi", event.target.value)}
                placeholder="5000"
                type="number"
                value={form.existingEmi}
              />
            </label>

            <label>
              Treatment amount
              <input
                min="0"
                onChange={(event) => updateField("requestedAmount", event.target.value)}
                placeholder="60000"
                required
                type="number"
                value={form.requestedAmount}
              />
            </label>

            <label>
              Credit score
              <input
                max="900"
                min="300"
                onChange={(event) => updateField("creditScore", event.target.value)}
                placeholder="720"
                type="number"
                value={form.creditScore}
              />
            </label>

            <label>
              Employment type
              <select
                onChange={(event) => updateField("employmentType", event.target.value)}
                value={form.employmentType}
              >
                <option value="salaried">Salaried</option>
                <option value="business">Business</option>
                <option value="self-employed">Self-employed</option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button disabled={loading} type="submit">
            {loading ? "Checking..." : "Check EMI eligibility"}
          </button>
        </form>

        <div className="health-emi-result">
          {!result ? (
            <div className="emi-empty-state">
              <FaRupeeSign aria-hidden="true" />
              <h2>Prediction will appear here</h2>
              <p>Use this module to discuss affordability, repayment tenures, and approval readiness.</p>
            </div>
          ) : (
            <>
              <section className="emi-score-card">
                <div className="emi-score-meter" style={scoreStyle}>
                  <span>{result.score}</span>
                </div>
                <div>
                  <h2>{result.decision}</h2>
                  <p>{riskCopy[result.riskLevel]} profile based on affordability, credit score, and existing EMI load.</p>
                </div>
              </section>

              <section className="emi-stat-grid">
                <Metric label="Monthly EMI capacity" value={`Rs ${result.monthlyEmiCapacity}`} />
                <Metric label="Recommended finance" value={`Rs ${result.recommendedAmount}`} />
                <Metric label="Estimated rate" value={`${result.interestRate}%`} />
              </section>

              <section className="emi-plan-section">
                <div className="emi-section-head">
                  <h2>Repayment options</h2>
                  <FaChartLine aria-hidden="true" />
                </div>
                <div className="emi-plan-grid">
                  {result.tenures?.map((plan) => (
                    <article className="emi-plan-card" key={plan.months}>
                      <strong>{plan.months} months</strong>
                      <span>Rs {plan.monthlyEmi}/month</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="emi-insight-grid">
                <InfoBlock icon={FaShieldAlt} items={result.reasons} title="Why this result" />
                <InfoBlock items={result.nextSteps} title="Next steps" />
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="emi-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function InfoBlock({ icon: Icon, items = [], title }) {
  return (
    <article className="emi-info-block">
      <div className="emi-section-head">
        <h2>{title}</h2>
        {Icon && <Icon aria-hidden="true" />}
      </div>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}
