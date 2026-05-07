"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaEdit, FaPills, FaTrash } from "react-icons/fa";
import {
  createMedicineReminder,
  deleteMedicineReminder,
  getMedicineReminders,
  markMedicineTaken,
  updateMedicineReminder,
} from "@/services/reminderService";
import "@/styles/reminders.css";

const emptyForm = {
  medicine: "",
  dosage: "",
  frequency: "daily",
  time: "09:00",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  notes: "",
  active: true,
};

const frequencyLabels = {
  once: "Once",
  twice: "Twice daily",
  daily: "Daily",
  weekly: "Weekly",
  "as-needed": "As needed",
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMedicineReminders();
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load reminders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadReminders();
    });
  }, [loadReminders]);

  const stats = useMemo(() => {
    const active = reminders.filter((item) => item.active).length;
    const takenToday = reminders.filter((item) => {
      if (!item.lastTakenAt) return false;
      return new Date(item.lastTakenAt).toDateString() === new Date().toDateString();
    }).length;

    return {
      active,
      paused: reminders.length - active,
      takenToday,
    };
  }, [reminders]);

  const visibleReminders = useMemo(() => {
    if (filter === "all") return reminders;
    if (filter === "paused") return reminders.filter((item) => !item.active);
    return reminders.filter((item) => item.active);
  }, [filter, reminders]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        endDate: form.endDate || undefined,
      };

      if (editingId) {
        await updateMedicineReminder(editingId, payload);
      } else {
        await createMedicineReminder(payload);
      }

      resetForm();
      await loadReminders();
    } catch (err) {
      setError(err.message || "Could not save reminder");
    } finally {
      setSaving(false);
    }
  };

  const editReminder = (reminder) => {
    setEditingId(reminder._id);
    setForm({
      medicine: reminder.medicine || "",
      dosage: reminder.dosage || "",
      frequency: reminder.frequency || "daily",
      time: reminder.time || "09:00",
      startDate: reminder.startDate ? reminder.startDate.slice(0, 10) : emptyForm.startDate,
      endDate: reminder.endDate ? reminder.endDate.slice(0, 10) : "",
      notes: reminder.notes || "",
      active: reminder.active !== false,
    });
  };

  const toggleReminder = async (reminder) => {
    await updateMedicineReminder(reminder._id, {
      ...reminder,
      active: !reminder.active,
      startDate: reminder.startDate?.slice(0, 10),
      endDate: reminder.endDate?.slice(0, 10) || undefined,
    });
    await loadReminders();
  };

  const markTaken = async (id) => {
    await markMedicineTaken(id);
    await loadReminders();
  };

  const removeReminder = async (id) => {
    await deleteMedicineReminder(id);
    await loadReminders();
  };

  return (
    <main className="reminders-page">
      <section className="reminders-hero">
        <div>
          <span className="eyebrow">Care schedule</span>
          <h1>Medicine Reminders</h1>
          <p>Keep daily doses visible, pause finished medicines, and mark each dose as taken.</p>
        </div>

        <div className="reminder-stats" aria-label="Reminder stats">
          <span><strong>{stats.active}</strong> Active</span>
          <span><strong>{stats.takenToday}</strong> Taken today</span>
          <span><strong>{stats.paused}</strong> Paused</span>
        </div>
      </section>

      <section className="reminders-layout">
        <form className="reminder-form" onSubmit={handleSubmit}>
          <div className="form-title">
            <FaPills aria-hidden="true" />
            <h2>{editingId ? "Edit reminder" : "New reminder"}</h2>
          </div>

          {error && <p className="form-error">{error}</p>}

          <label>
            Medicine
            <input
              name="medicine"
              value={form.medicine}
              onChange={handleChange}
              placeholder="Amlodipine"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Dosage
              <input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                placeholder="5 mg"
              />
            </label>

            <label>
              Time
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Frequency
              <select name="frequency" value={form.frequency} onChange={handleChange}>
                {Object.entries(frequencyLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              Start date
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            End date
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="After breakfast"
              rows="3"
            />
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            Reminder is active
          </label>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add reminder"}
            </button>
            {editingId && (
              <button className="btn-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="reminders-panel">
          <div className="filter-tabs">
            {["active", "paused", "all"].map((item) => (
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
            <p className="empty-state">Loading reminders...</p>
          ) : visibleReminders.length === 0 ? (
            <p className="empty-state">No reminders in this view.</p>
          ) : (
            <div className="reminder-list">
              {visibleReminders.map((reminder) => {
                const takenToday = reminder.lastTakenAt &&
                  new Date(reminder.lastTakenAt).toDateString() === new Date().toDateString();

                return (
                  <article className={`reminder-card ${!reminder.active ? "is-paused" : ""}`} key={reminder._id}>
                    <div className="reminder-card__main">
                      <span className="reminder-time">{reminder.time}</span>
                      <div>
                        <h3>{reminder.medicine}</h3>
                        <p>
                          {[reminder.dosage, frequencyLabels[reminder.frequency]].filter(Boolean).join(" | ")}
                        </p>
                        {reminder.notes && <small>{reminder.notes}</small>}
                      </div>
                    </div>

                    <div className="reminder-card__meta">
                      <span className={takenToday ? "status-pill done" : "status-pill"}>
                        {takenToday ? "Taken today" : reminder.active ? "Due" : "Paused"}
                      </span>
                    </div>

                    <div className="reminder-actions">
                      <button title="Mark taken" onClick={() => markTaken(reminder._id)}>
                        <FaCheck aria-hidden="true" />
                      </button>
                      <button title="Edit reminder" onClick={() => editReminder(reminder)}>
                        <FaEdit aria-hidden="true" />
                      </button>
                      <button onClick={() => toggleReminder(reminder)}>
                        {reminder.active ? "Pause" : "Resume"}
                      </button>
                      <button title="Delete reminder" onClick={() => removeReminder(reminder._id)}>
                        <FaTrash aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
