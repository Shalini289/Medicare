"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaHospital, FaProcedures, FaSave } from "react-icons/fa";
import {
  getHospitalPortalDashboard,
  updateHospitalPortal,
} from "@/services/hospitalService";
import { getCurrentUser } from "@/utils/auth";

const emptyHospitalForm = {
  name: "",
  city: "",
  address: "",
  phone: "",
  emergencyPhone: "",
  status: "active",
  beds: {
    ICU: "",
    oxygen: "",
    general: "",
  },
  occupiedBeds: {
    ICU: "",
    oxygen: "",
    general: "",
  },
};

const toForm = (hospital = {}) => ({
  name: hospital.name || "",
  city: hospital.city || "",
  address: hospital.address || "",
  phone: hospital.phone || "",
  emergencyPhone: hospital.emergencyPhone || "",
  status: hospital.status || "active",
  beds: {
    ICU: hospital.beds?.ICU ?? "",
    oxygen: hospital.beds?.oxygen ?? "",
    general: hospital.beds?.general ?? "",
  },
  occupiedBeds: {
    ICU: hospital.occupiedBeds?.ICU ?? "",
    oxygen: hospital.occupiedBeds?.oxygen ?? "",
    general: hospital.occupiedBeds?.general ?? "",
  },
});

const bedTypes = [
  ["ICU", "ICU"],
  ["oxygen", "Oxygen"],
  ["general", "General"],
];

const numberValue = (value) => Number(value || 0);

export default function HospitalPortalPage() {
  const router = useRouter();
  const [accessStatus, setAccessStatus] = useState("checking");
  const [hospital, setHospital] = useState(null);
  const [summary, setSummary] = useState({});
  const [form, setForm] = useState(emptyHospitalForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getHospitalPortalDashboard();
      setHospital(data.hospital || null);
      setSummary(data.summary || {});
      setForm(toForm(data.hospital || {}));
    } catch (err) {
      setError(err.message || "Could not load hospital portal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const user = getCurrentUser();

      if (user?.role !== "hospital") {
        setAccessStatus("denied");
        router.replace("/dashboard");
        return;
      }

      setAccessStatus("allowed");
      loadDashboard();
    });
  }, [loadDashboard, router]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const updateBed = (group, key, value) => {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [key]: value,
      },
    }));
    setMessage("");
  };

  const saveHospital = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.city.trim()) {
      setError("Hospital name and city are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = {
        ...form,
        beds: {
          ICU: numberValue(form.beds.ICU),
          oxygen: numberValue(form.beds.oxygen),
          general: numberValue(form.beds.general),
        },
        occupiedBeds: {
          ICU: numberValue(form.occupiedBeds.ICU),
          oxygen: numberValue(form.occupiedBeds.oxygen),
          general: numberValue(form.occupiedBeds.general),
        },
      };

      const data = await updateHospitalPortal(payload);
      setHospital(data.hospital || null);
      setSummary(data.summary || {});
      setForm(toForm(data.hospital || {}));
      setMessage("Hospital details updated.");
    } catch (err) {
      setError(err.message || "Could not save hospital details");
    } finally {
      setSaving(false);
    }
  };

  if (accessStatus !== "allowed") {
    return (
      <main className="hospital-portal-page">
        <p className="hospital-portal-alert">
          {accessStatus === "denied" ? "Hospital access only. Redirecting..." : "Checking hospital access..."}
        </p>
      </main>
    );
  }

  return (
    <main className="hospital-portal-page">
      <section className="hospital-portal-hero">
        <div>
          <span className="eyebrow">Hospital workspace</span>
          <h1>Hospital Portal</h1>
          <p>Manage your hospital profile, total beds, occupied beds, and real-time public availability.</p>
        </div>
        <button className="btn-primary" onClick={loadDashboard}>Refresh</button>
      </section>

      {error && <p className="hospital-portal-alert error">{error}</p>}
      {message && <p className="hospital-portal-alert success">{message}</p>}
      {loading && <p className="hospital-portal-alert">Loading hospital details...</p>}

      <section className="hospital-portal-stats">
        <div><strong>{summary.totalBeds || 0}</strong><span>Total beds</span></div>
        <div><strong>{summary.occupiedBeds || 0}</strong><span>Occupied</span></div>
        <div><strong>{summary.availableBeds || 0}</strong><span>Available</span></div>
        <div><strong>{summary.available?.ICU || 0}</strong><span>ICU available</span></div>
        <div><strong>{summary.available?.oxygen || 0}</strong><span>Oxygen available</span></div>
        <div><strong>{summary.available?.general || 0}</strong><span>General available</span></div>
      </section>

      <section className="hospital-portal-layout">
        <form className="hospital-portal-section" onSubmit={saveHospital}>
          <div className="hospital-portal-title">
            <FaHospital aria-hidden="true" />
            <h2>Hospital profile</h2>
          </div>

          <div className="hospital-portal-form-grid">
            <label>
              Hospital name
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </label>
            <label>
              City
              <input value={form.city} onChange={(event) => updateField("city", event.target.value)} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </label>
            <label>
              Emergency phone
              <input value={form.emergencyPhone} onChange={(event) => updateField("emergencyPhone", event.target.value)} />
            </label>
            <label>
              Status
              <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                <option value="active">Active</option>
                <option value="limited">Limited</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="hospital-portal-wide">
              Address
              <input value={form.address} onChange={(event) => updateField("address", event.target.value)} />
            </label>
          </div>

          <div className="hospital-portal-title">
            <FaProcedures aria-hidden="true" />
            <h2>Bed management</h2>
          </div>

          <div className="bed-management-grid">
            {bedTypes.map(([key, label]) => (
              <div className="bed-management-row" key={key}>
                <h3>{label}</h3>
                <label>
                  Total
                  <input
                    type="number"
                    min="0"
                    value={form.beds[key]}
                    onChange={(event) => updateBed("beds", key, event.target.value)}
                  />
                </label>
                <label>
                  Occupied
                  <input
                    type="number"
                    min="0"
                    value={form.occupiedBeds[key]}
                    onChange={(event) => updateBed("occupiedBeds", key, event.target.value)}
                  />
                </label>
                <p>{Math.max(numberValue(form.beds[key]) - numberValue(form.occupiedBeds[key]), 0)} available</p>
              </div>
            ))}
          </div>

          <button className="btn-primary" type="submit" disabled={saving}>
            <FaSave aria-hidden="true" />
            {saving ? "Saving..." : "Save hospital updates"}
          </button>
        </form>

        <aside className="hospital-portal-section">
          <h2>Public availability preview</h2>
          <div className="hospital-preview-card">
            <span className={`hospital-preview-status ${form.status}`}>{form.status}</span>
            <h3>{form.name || hospital?.name || "Hospital"}</h3>
            <p>{form.city || "City not set"}</p>
            <p>{form.address || "Address not set"}</p>
            <div className="hospital-preview-beds">
              {bedTypes.map(([key, label]) => (
                <div key={key}>
                  <span>{label}</span>
                  <strong>{Math.max(numberValue(form.beds[key]) - numberValue(form.occupiedBeds[key]), 0)}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
