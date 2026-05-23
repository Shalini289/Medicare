"use client";

import { useMemo, useState } from "react";
import {
  FaBell,
  FaExclamationTriangle,
  FaFileMedical,
  FaPills,
  FaShieldAlt,
  FaUpload,
} from "react-icons/fa";
import { analyzePrescription } from "@/services/prescriptionService";
import "@/styles/prescriptionAnalyzer.css";

const emptyAnalysis = {
  summary: "",
  medicines: [],
  safetyWarnings: [],
  possibleInteractions: [],
  adherenceTips: [],
  nextSteps: [],
  disclaimer: "",
};

export default function PrescriptionAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExtractedText, setShowExtractedText] = useState(false);

  const analysis = result?.analysis || emptyAnalysis;
  const hasResult = Boolean(result);

  const medicineCount = useMemo(
    () => analysis.medicines?.length || 0,
    [analysis.medicines]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Upload a prescription image or PDF first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzePrescription(file);
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not analyze prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="rx-analyzer-page">
      <section className="rx-analyzer-hero">
        <div>
          <span className="eyebrow">AI prescription support</span>
          <h1>AI Prescription Analyzer</h1>
          <p>
            Upload a prescription to extract medicines, understand dose instructions,
            check safety points, and prepare reminder-friendly medication details.
          </p>
        </div>

        <div className="rx-analyzer-summary">
          <span><strong>{medicineCount}</strong> Medicines found</span>
          <span><strong>{analysis.safetyWarnings?.length || 0}</strong> Safety notes</span>
          <span><strong>{analysis.possibleInteractions?.length || 0}</strong> Review points</span>
        </div>
      </section>

      <section className="rx-analyzer-layout">
        <form className="rx-upload-panel" onSubmit={handleSubmit}>
          <FaUpload aria-hidden="true" />
          <h2>Upload prescription</h2>
          <p>Use a clear PDF, PNG, JPG, or JPEG. Handwritten prescriptions work best when the photo is bright and uncropped.</p>

          <label className="rx-file-picker">
            <span>{file?.name || "Choose prescription file"}</span>
            <input
              accept=".pdf,image/png,image/jpeg,image/jpg"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="rx-primary-action" disabled={loading} type="submit">
            {loading ? "Analyzing..." : "Analyze prescription"}
          </button>

          <small>
            This does not replace a doctor or pharmacist review. Use it to understand and organize prescription information.
          </small>
        </form>

        <div className="rx-result-panel">
          {!hasResult ? (
            <div className="rx-empty-state">
              <FaFileMedical aria-hidden="true" />
              <h2>Prescription analysis will appear here</h2>
              <p>After upload, MediCare will show medicines, dose explanations, warnings, and next steps in a clean format.</p>
            </div>
          ) : (
            <>
              <section className="rx-section">
                <h2>Clinical summary</h2>
                <p>{analysis.summary}</p>
              </section>

              <section className="rx-section">
                <div className="rx-section-head">
                  <h2>Medicines</h2>
                  <FaPills aria-hidden="true" />
                </div>

                <div className="rx-medicine-grid">
                  {analysis.medicines?.map((medicine, index) => (
                    <article className="rx-medicine-card" key={`${medicine.name}-${index}`}>
                      <h3>{medicine.name}</h3>
                      <dl>
                        <div>
                          <dt>Dose</dt>
                          <dd>{medicine.dosage}</dd>
                        </div>
                        <div>
                          <dt>Frequency</dt>
                          <dd>{medicine.frequency}</dd>
                        </div>
                        <div>
                          <dt>Duration</dt>
                          <dd>{medicine.duration}</dd>
                        </div>
                        <div>
                          <dt>Purpose</dt>
                          <dd>{medicine.purpose}</dd>
                        </div>
                      </dl>
                      <p>{medicine.instructions}</p>
                      {medicine.reminderTimes?.length > 0 && (
                        <div className="rx-reminder-row">
                          <FaBell aria-hidden="true" />
                          {medicine.reminderTimes.join(", ")}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <section className="rx-alert-grid">
                <InfoList
                  icon={FaExclamationTriangle}
                  items={analysis.safetyWarnings}
                  title="Safety warnings"
                />
                <InfoList
                  icon={FaShieldAlt}
                  items={analysis.possibleInteractions}
                  title="Interaction review"
                />
              </section>

              <section className="rx-alert-grid">
                <InfoList items={analysis.adherenceTips} title="Adherence tips" />
                <InfoList items={analysis.nextSteps} title="Next steps" />
              </section>

              {analysis.disclaimer && <p className="rx-disclaimer">{analysis.disclaimer}</p>}

              <button
                className="rx-text-toggle"
                onClick={() => setShowExtractedText((value) => !value)}
                type="button"
              >
                {showExtractedText ? "Hide extracted text" : "Show extracted text"}
              </button>

              {showExtractedText && (
                <pre className="rx-extracted-text">{result.extractedText}</pre>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function InfoList({ icon: Icon, items = [], title }) {
  const visibleItems = items.length > 0 ? items : ["No specific item was detected. Confirm details with your care provider."];

  return (
    <section className="rx-info-list">
      <div className="rx-section-head">
        <h2>{title}</h2>
        {Icon && <Icon aria-hidden="true" />}
      </div>
      <ul>
        {visibleItems.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
