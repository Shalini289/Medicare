"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaEdit, FaFilePrescription, FaPlus, FaPrint, FaTrash } from "react-icons/fa";
import {
  createPrescription,
  deletePrescription,
  getPrescriptions,
  updatePrescription,
} from "@/services/prescriptionService";
import "@/styles/prescriptions.css";

const blankMedicine = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const blankForm = {
  doctorName: "",
  diagnosis: "",
  issuedDate: new Date().toISOString().slice(0, 10),
  validUntil: "",
  followUpDate: "",
  status: "active",
  patientInstructions: "",
  digitalSignature: "",
  notes: "",
  medicines: [{ ...blankMedicine }],
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPrescriptions();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load prescriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadPrescriptions();
    });
  }, [loadPrescriptions]);

  const visiblePrescriptions = useMemo(() => {
    if (filter === "all") return prescriptions;
    return prescriptions.filter((item) => item.status === filter);
  }, [filter, prescriptions]);

  const totals = useMemo(() => ({
    active: prescriptions.filter((item) => item.status === "active").length,
    medicines: prescriptions.reduce((sum, item) => sum + (item.medicines?.length || 0), 0),
    completed: prescriptions.filter((item) => item.status === "completed").length,
  }), [prescriptions]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateMedicine = (index, field, value) => {
    setForm((current) => ({
      ...current,
      medicines: current.medicines.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addMedicine = () => {
    setForm((current) => ({
      ...current,
      medicines: [...current.medicines, { ...blankMedicine }],
    }));
  };

  const removeMedicine = (index) => {
    setForm((current) => ({
      ...current,
      medicines: current.medicines.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
  };

  const savePrescription = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updatePrescription(editingId, form);
      } else {
        await createPrescription(form);
      }

      resetForm();
      await loadPrescriptions();
    } catch (err) {
      setError(err.message || "Could not save prescription");
    } finally {
      setSaving(false);
    }
  };

  const editPrescription = (prescription) => {
    setEditingId(prescription._id);
    setForm({
      doctorName: prescription.doctorName || "",
      diagnosis: prescription.diagnosis || "",
      issuedDate: prescription.issuedDate ? prescription.issuedDate.slice(0, 10) : blankForm.issuedDate,
      validUntil: prescription.validUntil ? prescription.validUntil.slice(0, 10) : "",
      followUpDate: prescription.followUpDate ? prescription.followUpDate.slice(0, 10) : "",
      status: prescription.status || "active",
      patientInstructions: prescription.patientInstructions || "",
      digitalSignature: prescription.digitalSignature || "",
      notes: prescription.notes || "",
      medicines: prescription.medicines?.length
        ? prescription.medicines.map((item) => ({
            name: item.name || "",
            dosage: item.dosage || "",
            frequency: item.frequency || "",
            duration: item.duration || "",
            instructions: item.instructions || "",
          }))
        : [{ ...blankMedicine }],
    });
  };

  const removePrescription = async (id) => {
    await deletePrescription(id);
    await loadPrescriptions();
  };

  return (
    <main className="prescriptions-page">
      <section className="prescriptions-hero">
        <div>
          <span className="eyebrow">Medication record</span>
          <h1>Prescriptions</h1>
          <p>Save doctor instructions, track active medicines, and jump into pharmacy ordering when you need a refill.</p>
        </div>

        <div className="prescription-stats">
          <span><strong>{totals.active}</strong> Active</span>
          <span><strong>{totals.medicines}</strong> Medicines</span>
          <span><strong>{totals.completed}</strong> Completed</span>
        </div>
      </section>

      <section className="prescriptions-layout">
        <form className="prescription-form" onSubmit={savePrescription}>
          <div className="form-title">
            <FaFilePrescription aria-hidden="true" />
            <h2>{editingId ? "Edit prescription" : "New prescription"}</h2>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-grid">
            <label>
              Doctor
              <input
                name="doctorName"
                value={form.doctorName}
                onChange={updateField}
                placeholder="Dr. Sharma"
              />
            </label>

            <label>
              Issued date
              <input
                type="date"
                name="issuedDate"
                value={form.issuedDate}
                onChange={updateField}
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Valid until
              <input
                type="date"
                name="validUntil"
                value={form.validUntil}
                onChange={updateField}
              />
            </label>

            <label>
              Follow-up date
              <input
                type="date"
                name="followUpDate"
                value={form.followUpDate}
                onChange={updateField}
              />
            </label>
          </div>

          <label>
            Diagnosis
            <input
              name="diagnosis"
              value={form.diagnosis}
              onChange={updateField}
              placeholder="Fever, migraine, follow-up care"
            />
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={updateField}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <div className="medicine-lines">
            <div className="medicine-lines__head">
              <h3>Medicines</h3>
              <button type="button" onClick={addMedicine}>
                <FaPlus aria-hidden="true" /> Add
              </button>
            </div>

            {form.medicines.map((medicine, index) => (
              <div className="medicine-line" key={`${index}-${medicine.name}`}>
                <input
                  value={medicine.name}
                  onChange={(event) => updateMedicine(index, "name", event.target.value)}
                  placeholder="Medicine name"
                  required
                />
                <input
                  value={medicine.dosage}
                  onChange={(event) => updateMedicine(index, "dosage", event.target.value)}
                  placeholder="Dosage"
                />
                <input
                  value={medicine.frequency}
                  onChange={(event) => updateMedicine(index, "frequency", event.target.value)}
                  placeholder="Frequency"
                />
                <input
                  value={medicine.duration}
                  onChange={(event) => updateMedicine(index, "duration", event.target.value)}
                  placeholder="Duration"
                />
                <input
                  value={medicine.instructions}
                  onChange={(event) => updateMedicine(index, "instructions", event.target.value)}
                  placeholder="Instructions"
                />
                <button type="button" title="Remove medicine" onClick={() => removeMedicine(index)}>
                  <FaTrash aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <label>
            Patient instructions
            <textarea
              name="patientInstructions"
              value={form.patientInstructions}
              onChange={updateField}
              placeholder="Take after meals, avoid driving, drink fluids"
              rows="3"
            />
          </label>

          <label>
            Digital signature
            <input
              name="digitalSignature"
              value={form.digitalSignature}
              onChange={updateField}
              placeholder="Dr. Sharma, Reg. No. 12345"
            />
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={updateField}
              placeholder="Diet, follow-up date, allergy notes"
              rows="3"
            />
          </label>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Save prescription"}
            </button>
            {editingId && (
              <button className="btn-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="prescription-panel">
          <div className="filter-tabs">
            {["active", "completed", "archived", "all"].map((item) => (
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
            <p className="empty-state">Loading prescriptions...</p>
          ) : visiblePrescriptions.length === 0 ? (
            <p className="empty-state">No prescriptions in this view.</p>
          ) : (
            <div className="prescription-list">
              {visiblePrescriptions.map((prescription) => (
                <article className="prescription-card" key={prescription._id}>
                  <div className="prescription-card__head">
                    <div>
                      <span className="status-pill">{prescription.status}</span>
                      <h3>{prescription.diagnosis || "Prescription"}</h3>
                      <strong className="rx-code">{prescription.prescriptionCode || "Digital Rx"}</strong>
                      <p>
                        {[prescription.doctorName, prescription.issuedDate && new Date(prescription.issuedDate).toLocaleDateString()]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    </div>

                    <div className="prescription-actions">
                      <button title="Edit prescription" onClick={() => editPrescription(prescription)}>
                        <FaEdit aria-hidden="true" />
                      </button>
                      <button title="Print digital prescription" onClick={() => window.print()}>
                        <FaPrint aria-hidden="true" />
                      </button>
                      <button title="Delete prescription" onClick={() => removePrescription(prescription._id)}>
                        <FaTrash aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="prescription-medicines">
                    {prescription.medicines?.map((medicine) => (
                      <div className="prescription-medicine" key={medicine._id || medicine.name}>
                        <div>
                          <strong>{medicine.name}</strong>
                          <small>
                            {[medicine.dosage, medicine.frequency, medicine.duration]
                              .filter(Boolean)
                              .join(" | ")}
                          </small>
                          {medicine.instructions && <p>{medicine.instructions}</p>}
                        </div>
                        <Link href={`/pharmacy?q=${encodeURIComponent(medicine.name)}`}>
                          Order
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="rx-meta">
                    {prescription.validUntil && (
                      <span>Valid until {new Date(prescription.validUntil).toLocaleDateString()}</span>
                    )}
                    {prescription.followUpDate && (
                      <span>Follow-up {new Date(prescription.followUpDate).toLocaleDateString()}</span>
                    )}
                    {prescription.digitalSignature && (
                      <span>Signed by {prescription.digitalSignature}</span>
                    )}
                  </div>

                  {prescription.patientInstructions && (
                    <p className="prescription-instructions">{prescription.patientInstructions}</p>
                  )}

                  {prescription.notes && <p className="prescription-notes">{prescription.notes}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
