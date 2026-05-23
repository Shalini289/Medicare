"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCloudUploadAlt, FaDatabase, FaLaptopMedical, FaWifi } from "react-icons/fa";
import {
  createDoctorNote,
  getDoctorPortalDashboard,
} from "@/services/doctorPortalService";
import "@/styles/offlineClinic.css";

const STORAGE_KEY = "medicareOfflineClinicDrafts";
const PATIENT_CACHE_KEY = "medicareOfflineClinicPatients";

const blankVisit = {
  patientId: "",
  patientName: "",
  visitDate: new Date().toISOString().slice(0, 10),
  symptoms: "",
  vitals: "",
  diagnosis: "",
  plan: "",
  medicines: "",
  followUp: "",
};

const readStoredJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};

export default function OfflineClinicPage() {
  const [visit, setVisit] = useState(blankVisit);
  const [drafts, setDrafts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [online, setOnline] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [syncingId, setSyncingId] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const queuedDrafts = useMemo(
    () => drafts.filter((draft) => draft.status !== "synced"),
    [drafts]
  );

  const syncedDrafts = useMemo(
    () => drafts.filter((draft) => draft.status === "synced"),
    [drafts]
  );

  const saveDrafts = useCallback((nextDrafts) => {
    setDrafts(nextDrafts);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDrafts));
  }, []);

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    setError("");

    const cachedPatients = readStoredJson(PATIENT_CACHE_KEY, []);
    if (cachedPatients.length) setPatients(cachedPatients);

    try {
      const dashboard = await getDoctorPortalDashboard();
      const nextPatients = Array.isArray(dashboard?.patients) ? dashboard.patients : [];
      setPatients(nextPatients);
      window.localStorage.setItem(PATIENT_CACHE_KEY, JSON.stringify(nextPatients));
    } catch (err) {
      setError(err.message || "Could not load doctor patient list. Cached patients can still be used offline.");
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    setDrafts(readStoredJson(STORAGE_KEY, []));
    setPatients(readStoredJson(PATIENT_CACHE_KEY, []));
    loadPatients();

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [loadPatients]);

  const updateVisit = (field, value) => {
    setVisit((current) => {
      if (field !== "patientId") return { ...current, [field]: value };

      const patient = patients.find((item) => item._id === value);
      return {
        ...current,
        patientId: value,
        patientName: patient?.name || current.patientName,
      };
    });
  };

  const saveOfflineVisit = (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!visit.patientId && !visit.patientName.trim()) {
      setError("Select a patient or enter a patient name before saving offline.");
      return;
    }

    const draft = {
      ...visit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: visit.patientId ? "queued" : "draft",
      syncError: "",
    };

    saveDrafts([draft, ...drafts]);
    setVisit(blankVisit);
    setStatus("Visit saved locally. It will stay on this device until synced.");
  };

  const buildNotePayload = (draft) => ({
    patientId: draft.patientId,
    type: "consultation",
    title: `Offline clinic visit - ${draft.visitDate}`,
    transcript: [
      draft.symptoms && `Symptoms: ${draft.symptoms}`,
      draft.vitals && `Vitals: ${draft.vitals}`,
      draft.medicines && `Medicines: ${draft.medicines}`,
      draft.followUp && `Follow-up: ${draft.followUp}`,
    ].filter(Boolean).join("\n"),
    summary: draft.diagnosis || "Offline clinic visit",
    plan: draft.plan,
  });

  const syncDraft = async (draft) => {
    setError("");
    setStatus("");

    if (!draft.patientId) {
      setError("This draft needs a linked patient before it can sync to the doctor portal.");
      return;
    }

    setSyncingId(draft.id);

    try {
      await createDoctorNote("", buildNotePayload(draft));
      const nextDrafts = drafts.map((item) =>
        item.id === draft.id
          ? { ...item, status: "synced", syncedAt: new Date().toISOString(), syncError: "" }
          : item
      );
      saveDrafts(nextDrafts);
      setStatus("Visit synced to doctor notes.");
    } catch (err) {
      const nextDrafts = drafts.map((item) =>
        item.id === draft.id
          ? { ...item, status: "failed", syncError: err.message || "Sync failed" }
          : item
      );
      saveDrafts(nextDrafts);
      setError(err.message || "Could not sync visit");
    } finally {
      setSyncingId("");
    }
  };

  const syncAll = async () => {
    for (const draft of queuedDrafts.filter((item) => item.patientId)) {
      await syncDraft(draft);
    }
  };

  const deleteDraft = (id) => {
    saveDrafts(drafts.filter((draft) => draft.id !== id));
  };

  return (
    <main className="offline-clinic-page">
      <section className="offline-clinic-hero">
        <div>
          <span className="eyebrow">Low bandwidth clinic mode</span>
          <h1>Offline-to-Online Clinic System</h1>
          <p>
            Capture patient visits on this device during poor internet, keep them in a local sync queue,
            and upload them to doctor notes when the connection returns.
          </p>
        </div>

        <div className={`offline-status-card ${online ? "is-online" : "is-offline"}`}>
          <FaWifi aria-hidden="true" />
          <strong>{online ? "Online" : "Offline"}</strong>
          <span>{queuedDrafts.length} waiting, {syncedDrafts.length} synced</span>
        </div>
      </section>

      <section className="offline-clinic-layout">
        <form className="offline-visit-form" onSubmit={saveOfflineVisit}>
          <div className="offline-section-head">
            <h2>New offline visit</h2>
            <FaLaptopMedical aria-hidden="true" />
          </div>

          <label>
            Linked patient
            <select
              disabled={loadingPatients && patients.length === 0}
              onChange={(event) => updateVisit("patientId", event.target.value)}
              value={visit.patientId}
            >
              <option value="">Manual or unsynced patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} {patient.phone ? `- ${patient.phone}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Patient name
            <input
              onChange={(event) => updateVisit("patientName", event.target.value)}
              placeholder="Patient name for local record"
              value={visit.patientName}
            />
          </label>

          <label>
            Visit date
            <input
              onChange={(event) => updateVisit("visitDate", event.target.value)}
              type="date"
              value={visit.visitDate}
            />
          </label>

          <label>
            Symptoms
            <textarea
              onChange={(event) => updateVisit("symptoms", event.target.value)}
              placeholder="Fever for 2 days, cough, weakness..."
              value={visit.symptoms}
            />
          </label>

          <label>
            Vitals
            <input
              onChange={(event) => updateVisit("vitals", event.target.value)}
              placeholder="BP 120/80, pulse 82, SpO2 98"
              value={visit.vitals}
            />
          </label>

          <label>
            Assessment
            <input
              onChange={(event) => updateVisit("diagnosis", event.target.value)}
              placeholder="Clinical assessment"
              value={visit.diagnosis}
            />
          </label>

          <label>
            Plan
            <textarea
              onChange={(event) => updateVisit("plan", event.target.value)}
              placeholder="Advice, tests, care plan, referral..."
              value={visit.plan}
            />
          </label>

          <div className="offline-form-grid">
            <label>
              Medicines
              <input
                onChange={(event) => updateVisit("medicines", event.target.value)}
                placeholder="Paracetamol 500mg..."
                value={visit.medicines}
              />
            </label>

            <label>
              Follow-up
              <input
                onChange={(event) => updateVisit("followUp", event.target.value)}
                placeholder="After 3 days"
                value={visit.followUp}
              />
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}
          {status && <p className="offline-status-message">{status}</p>}

          <button type="submit">Save offline visit</button>
        </form>

        <section className="offline-sync-panel">
          <div className="offline-section-head">
            <div>
              <h2>Sync queue</h2>
              <p>Local visits are stored in this browser until uploaded or deleted.</p>
            </div>
            <button disabled={!online || queuedDrafts.length === 0} onClick={syncAll} type="button">
              <FaCloudUploadAlt aria-hidden="true" />
              Sync all
            </button>
          </div>

          <div className="offline-metrics">
            <Metric label="Queued" value={queuedDrafts.length} />
            <Metric label="Synced" value={syncedDrafts.length} />
            <Metric label="Cached patients" value={patients.length} />
          </div>

          <div className="offline-draft-list">
            {drafts.length === 0 ? (
              <div className="offline-empty-state">
                <FaDatabase aria-hidden="true" />
                <h3>No offline visits yet</h3>
                <p>Saved visits will appear here and can be synced when the API is reachable.</p>
              </div>
            ) : (
              drafts.map((draft) => (
                <article className={`offline-draft-card is-${draft.status}`} key={draft.id}>
                  <div>
                    <span>{draft.status}</span>
                    <h3>{draft.patientName || "Linked patient"}</h3>
                    <p>{draft.visitDate} | {draft.diagnosis || "No assessment added"}</p>
                    {draft.syncError && <small>{draft.syncError}</small>}
                  </div>

                  <div className="offline-draft-actions">
                    {draft.status !== "synced" && (
                      <button
                        disabled={!online || syncingId === draft.id || !draft.patientId}
                        onClick={() => syncDraft(draft)}
                        type="button"
                      >
                        {syncingId === draft.id ? "Syncing" : "Sync"}
                      </button>
                    )}
                    <button onClick={() => deleteDraft(draft.id)} type="button">
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="offline-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
