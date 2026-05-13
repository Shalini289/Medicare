"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaEdit, FaSyringe, FaTrash } from "react-icons/fa";
import {
  completeVaccination,
  createVaccination,
  deleteVaccination,
  getVaccinations,
  updateVaccination,
} from "@/services/vaccinationService";
import "@/styles/vaccinations.css";

const emptyForm = {
  vaccineName: "",
  dose: "",
  dueDate: new Date().toISOString().slice(0, 10),
  administeredDate: "",
  provider: "",
  location: "",
  notes: "",
  status: "scheduled",
};

export default function VaccinationsPage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, completed: 0, upcoming: 0, overdue: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("scheduled");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadVaccinations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getVaccinations();
      setRecords(Array.isArray(data.records) ? data.records : []);
      setSummary(data.summary || { total: 0, completed: 0, upcoming: 0, overdue: 0 });
    } catch (err) {
      setError(err.message || "Could not load vaccinations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadVaccinations();
    });
  }, [loadVaccinations]);

  const visibleRecords = useMemo(() => {
    if (filter === "all") return records;
    if (filter === "overdue") return records.filter((record) => record.derivedStatus === "overdue");
    return records.filter((record) => record.status === filter);
  }, [filter, records]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        administeredDate: form.administeredDate || undefined,
      };

      if (editingId) {
        await updateVaccination(editingId, payload);
      } else {
        await createVaccination(payload);
      }

      resetForm();
      await loadVaccinations();
    } catch (err) {
      setError(err.message || "Could not save vaccination");
    } finally {
      setSaving(false);
    }
  };

  const editRecord = (record) => {
    setEditingId(record._id);
    setForm({
      vaccineName: record.vaccineName || "",
      dose: record.dose || "",
      dueDate: record.dueDate ? record.dueDate.slice(0, 10) : emptyForm.dueDate,
      administeredDate: record.administeredDate ? record.administeredDate.slice(0, 10) : "",
      provider: record.provider || "",
      location: record.location || "",
      notes: record.notes || "",
      status: record.status || "scheduled",
    });
  };

  const markComplete = async (record) => {
    await completeVaccination(record._id, {
      administeredDate: new Date().toISOString().slice(0, 10),
      provider: record.provider,
      location: record.location,
    });
    await loadVaccinations();
  };

  const removeRecord = async (id) => {
    await deleteVaccination(id);
    await loadVaccinations();
  };

  return (
    <main className="vaccinations-page">
      <section className="vaccinations-hero">
        <div>
          <span className="eyebrow">Immunization record</span>
          <h1>Vaccinations</h1>
          <p>Track upcoming vaccines, completed doses, provider details, and overdue immunizations.</p>
        </div>

        <div className="vaccination-stats">
          <span><strong>{summary.upcoming}</strong> Upcoming</span>
          <span><strong>{summary.overdue}</strong> Overdue</span>
          <span><strong>{summary.completed}</strong> Completed</span>
        </div>
      </section>

      <section className="vaccinations-layout">
        <form className="vaccination-form" onSubmit={saveRecord}>
          <div className="form-title">
            <FaSyringe aria-hidden="true" />
            <h2>{editingId ? "Edit vaccine" : "Add vaccine"}</h2>
          </div>

          {error && <p className="form-error">{error}</p>}

          <label>
            Vaccine
            <input
              name="vaccineName"
              value={form.vaccineName}
              onChange={updateField}
              placeholder="Influenza, COVID booster, Hepatitis B"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Dose
              <input name="dose" value={form.dose} onChange={updateField} placeholder="Dose 1" />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Due date
              <input type="date" name="dueDate" value={form.dueDate} onChange={updateField} required />
            </label>
            <label>
              Administered date
              <input type="date" name="administeredDate" value={form.administeredDate} onChange={updateField} />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Provider
              <input name="provider" value={form.provider} onChange={updateField} placeholder="Clinic or doctor" />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={updateField} placeholder="City or center" />
            </label>
          </div>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={updateField}
              placeholder="Side effects, next dose, batch info"
              rows="3"
            />
          </label>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add vaccine"}
            </button>
            {editingId && (
              <button className="btn-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="vaccination-panel">
          <div className="filter-tabs">
            {["scheduled", "overdue", "completed", "missed", "all"].map((item) => (
              <button
                key={item}
                className={filter === item ? "is-selected" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="empty-state">Loading vaccinations...</p>
          ) : visibleRecords.length === 0 ? (
            <p className="empty-state">No vaccinations in this view.</p>
          ) : (
            <div className="vaccination-list">
              {visibleRecords.map((record) => (
                <article className={`vaccination-card ${record.derivedStatus === "overdue" ? "is-overdue" : ""}`} key={record._id}>
                  <div className="vaccination-card__head">
                    <div>
                      <span>{record.derivedStatus || record.status}</span>
                      <h2>{record.vaccineName}</h2>
                      <p>{[record.dose, record.provider, record.location].filter(Boolean).join(" | ")}</p>
                    </div>
                    <strong>{new Date(record.dueDate).toLocaleDateString()}</strong>
                  </div>

                  {record.notes && <p className="vaccination-notes">{record.notes}</p>}

                  <div className="vaccination-actions">
                    {record.status !== "completed" && (
                      <button onClick={() => markComplete(record)}>
                        <FaCheck aria-hidden="true" /> Complete
                      </button>
                    )}
                    <button onClick={() => editRecord(record)}>
                      <FaEdit aria-hidden="true" /> Edit
                    </button>
                    <button onClick={() => removeRecord(record._id)}>
                      <FaTrash aria-hidden="true" /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
