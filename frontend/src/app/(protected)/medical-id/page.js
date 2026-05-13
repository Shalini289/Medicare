"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaIdCard, FaPlus, FaPrint, FaTrash } from "react-icons/fa";
import {
  getMedicalProfile,
  saveMedicalProfile,
} from "@/services/medicalProfileService";
import "@/styles/medicalId.css";

const createClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createEmptyContact = () => ({
  clientId: createClientId(),
  name: "",
  relation: "",
  phone: "",
});

const createEmptyHistory = () => ({
  clientId: createClientId(),
  type: "visit",
  title: "",
  doctorName: "",
  facility: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
  attachmentsText: "",
});

const createEmptyForm = () => ({
  bloodGroup: "",
  allergiesText: "",
  conditionsText: "",
  currentMedicationsText: "",
  medicalHistory: [createEmptyHistory()],
  emergencyContacts: [createEmptyContact()],
  insurance: {
    provider: "",
    policyNumber: "",
    validTill: "",
  },
  primaryDoctor: "",
  organDonor: false,
  notes: "",
});

const listText = (items) => (Array.isArray(items) ? items.join(", ") : "");
const splitText = (text) =>
  String(text || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function MedicalIdPage() {
  const [form, setForm] = useState(createEmptyForm);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hydrateForm = useCallback((profile) => {
    if (!profile) return;

    setForm({
      bloodGroup: profile.bloodGroup || "",
      allergiesText: listText(profile.allergies),
      conditionsText: listText(profile.conditions),
      currentMedicationsText: listText(profile.currentMedications),
      medicalHistory: profile.medicalHistory?.length
        ? profile.medicalHistory.map((entry) => ({
            clientId: entry._id || createClientId(),
            type: entry.type || "visit",
            title: entry.title || "",
            doctorName: entry.doctorName || "",
            facility: entry.facility || "",
            date: entry.date ? entry.date.slice(0, 10) : createEmptyHistory().date,
            notes: entry.notes || "",
            attachmentsText: listText(entry.attachments),
          }))
        : [createEmptyHistory()],
      emergencyContacts: profile.emergencyContacts?.length
        ? profile.emergencyContacts.map((contact) => ({
            clientId: contact._id || createClientId(),
            name: contact.name || "",
            relation: contact.relation || "",
            phone: contact.phone || "",
          }))
        : [createEmptyContact()],
      insurance: {
        provider: profile.insurance?.provider || "",
        policyNumber: profile.insurance?.policyNumber || "",
        validTill: profile.insurance?.validTill
          ? profile.insurance.validTill.slice(0, 10)
          : "",
      },
      primaryDoctor: profile.primaryDoctor || "",
      organDonor: Boolean(profile.organDonor),
      notes: profile.notes || "",
    });
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMedicalProfile();
      hydrateForm(data.profile);
      setCompletion(data.completion || 0);
    } catch (err) {
      setError(err.message || "Could not load medical ID");
    } finally {
      setLoading(false);
    }
  }, [hydrateForm]);

  useEffect(() => {
    queueMicrotask(() => {
      loadProfile();
    });
  }, [loadProfile]);

  const emergencyContact = useMemo(() => (
    form.emergencyContacts.find((contact) => contact.name || contact.phone) || createEmptyContact()
  ), [form.emergencyContacts]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateInsurance = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      insurance: {
        ...current.insurance,
        [name]: value,
      },
    }));
  };

  const updateContact = (index, field, value) => {
    setForm((current) => ({
      ...current,
      emergencyContacts: current.emergencyContacts.map((contact, itemIndex) =>
        itemIndex === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const addContact = () => {
    setForm((current) => ({
      ...current,
      emergencyContacts: [...current.emergencyContacts, createEmptyContact()],
    }));
  };

  const removeContact = (index) => {
    setForm((current) => ({
      ...current,
      emergencyContacts: current.emergencyContacts.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateHistory = (index, field, value) => {
    setForm((current) => ({
      ...current,
      medicalHistory: current.medicalHistory.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const addHistory = () => {
    setForm((current) => ({
      ...current,
      medicalHistory: [...current.medicalHistory, createEmptyHistory()],
    }));
  };

  const removeHistory = (index) => {
    setForm((current) => ({
      ...current,
      medicalHistory: current.medicalHistory.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        bloodGroup: form.bloodGroup,
        allergies: splitText(form.allergiesText),
        conditions: splitText(form.conditionsText),
        currentMedications: splitText(form.currentMedicationsText),
        medicalHistory: form.medicalHistory.map(({ clientId, ...entry }) => ({
          attachments: splitText(entry.attachmentsText),
        })),
        emergencyContacts: form.emergencyContacts.map(({ clientId, ...contact }) => contact),
        insurance: {
          ...form.insurance,
          validTill: form.insurance.validTill || undefined,
        },
        primaryDoctor: form.primaryDoctor,
        organDonor: form.organDonor,
        notes: form.notes,
      };

      const data = await saveMedicalProfile(payload);
      hydrateForm(data.profile);
      setCompletion(data.completion || 0);
      setMessage("Medical ID saved");
    } catch (err) {
      setError(err.message || "Could not save medical ID");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="medical-id-page">
      <section className="medical-id-hero">
        <div>
          <span className="eyebrow">Emergency profile</span>
          <h1>Medical ID</h1>
          <p>Keep essential health details ready for appointments, caregivers, and emergencies.</p>
        </div>

        <div className="medical-completion">
          <strong>{completion}%</strong>
          <span>Complete</span>
        </div>
      </section>

      <section className="medical-id-layout">
        <aside className="medical-card printable-card">
          <div className="medical-card__head">
            <FaIdCard aria-hidden="true" />
            <div>
              <h2>Emergency Card</h2>
              <p>Show this in urgent care</p>
            </div>
          </div>

          <dl>
            <div>
              <dt>Blood group</dt>
              <dd>{form.bloodGroup || "Not set"}</dd>
            </div>
            <div>
              <dt>Allergies</dt>
              <dd>{form.allergiesText || "None added"}</dd>
            </div>
            <div>
              <dt>Conditions</dt>
              <dd>{form.conditionsText || "None added"}</dd>
            </div>
            <div>
              <dt>Current meds</dt>
              <dd>{form.currentMedicationsText || "None added"}</dd>
            </div>
            <div>
              <dt>Emergency contact</dt>
              <dd>
                {emergencyContact.name || "Not set"}
                {emergencyContact.phone ? `, ${emergencyContact.phone}` : ""}
              </dd>
            </div>
            <div>
              <dt>Primary doctor</dt>
              <dd>{form.primaryDoctor || "Not set"}</dd>
            </div>
          </dl>

          <button className="btn-secondary print-button" onClick={() => window.print()}>
            <FaPrint aria-hidden="true" /> Print card
          </button>
        </aside>

        <form className="medical-form" onSubmit={submitProfile}>
          {loading && <p className="empty-state">Loading medical ID...</p>}
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}

          <div className="form-section">
            <h2>Clinical details</h2>

            <div className="form-grid">
              <label>
                Blood group
                <select name="bloodGroup" value={form.bloodGroup} onChange={updateField}>
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </label>

              <label>
                Primary doctor
                <input
                  name="primaryDoctor"
                  value={form.primaryDoctor}
                  onChange={updateField}
                  placeholder="Dr. Mehta, Cardiologist"
                />
              </label>
            </div>

            <label>
              Allergies
              <input
                name="allergiesText"
                value={form.allergiesText}
                onChange={updateField}
                placeholder="Penicillin, peanuts"
              />
            </label>

            <label>
              Chronic conditions
              <input
                name="conditionsText"
                value={form.conditionsText}
                onChange={updateField}
                placeholder="Asthma, diabetes"
              />
            </label>

            <label>
              Current medications
              <input
                name="currentMedicationsText"
                value={form.currentMedicationsText}
                onChange={updateField}
                placeholder="Metformin 500mg, Vitamin D"
              />
            </label>
          </div>

          <div className="form-section">
            <div className="section-head">
              <h2>Medical history</h2>
              <button type="button" onClick={addHistory}>
                <FaPlus aria-hidden="true" /> Add event
              </button>
            </div>

            {form.medicalHistory.map((entry, index) => (
              <div className="history-line" key={entry.clientId || entry._id || index}>
                <div className="form-grid">
                  <label>
                    Type
                    <select
                      value={entry.type}
                      onChange={(event) => updateHistory(index, "type", event.target.value)}
                    >
                      {["visit", "diagnosis", "procedure", "surgery", "admission", "lab", "imaging", "vaccination", "other"].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Date
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(event) => updateHistory(index, "date", event.target.value)}
                    />
                  </label>
                </div>

                <input
                  value={entry.title}
                  onChange={(event) => updateHistory(index, "title", event.target.value)}
                  placeholder="Event title, diagnosis, or procedure"
                />

                <div className="form-grid">
                  <input
                    value={entry.doctorName}
                    onChange={(event) => updateHistory(index, "doctorName", event.target.value)}
                    placeholder="Doctor"
                  />
                  <input
                    value={entry.facility}
                    onChange={(event) => updateHistory(index, "facility", event.target.value)}
                    placeholder="Hospital or clinic"
                  />
                </div>

                <textarea
                  value={entry.notes}
                  onChange={(event) => updateHistory(index, "notes", event.target.value)}
                  rows="3"
                  placeholder="Symptoms, treatment, findings, discharge summary"
                />

                <input
                  value={entry.attachmentsText}
                  onChange={(event) => updateHistory(index, "attachmentsText", event.target.value)}
                  placeholder="Attachment links or report names, comma separated"
                />

                <button type="button" className="history-remove" onClick={() => removeHistory(index)}>
                  <FaTrash aria-hidden="true" /> Remove event
                </button>
              </div>
            ))}
          </div>

          <div className="form-section">
            <div className="section-head">
              <h2>Emergency contacts</h2>
              <button type="button" onClick={addContact}>
                <FaPlus aria-hidden="true" /> Add
              </button>
            </div>

            {form.emergencyContacts.map((contact, index) => (
              <div className="contact-line" key={contact.clientId || contact._id || index}>
                <input
                  value={contact.name}
                  onChange={(event) => updateContact(index, "name", event.target.value)}
                  placeholder="Name"
                />
                <input
                  value={contact.relation}
                  onChange={(event) => updateContact(index, "relation", event.target.value)}
                  placeholder="Relation"
                />
                <input
                  value={contact.phone}
                  onChange={(event) => updateContact(index, "phone", event.target.value)}
                  placeholder="Phone"
                />
                <button type="button" title="Remove contact" onClick={() => removeContact(index)}>
                  <FaTrash aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <div className="form-section">
            <h2>Insurance and notes</h2>

            <div className="form-grid">
              <label>
                Insurance provider
                <input
                  name="provider"
                  value={form.insurance.provider}
                  onChange={updateInsurance}
                  placeholder="Provider"
                />
              </label>

              <label>
                Policy number
                <input
                  name="policyNumber"
                  value={form.insurance.policyNumber}
                  onChange={updateInsurance}
                  placeholder="Policy number"
                />
              </label>
            </div>

            <label>
              Valid till
              <input
                type="date"
                name="validTill"
                value={form.insurance.validTill}
                onChange={updateInsurance}
              />
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                name="organDonor"
                checked={form.organDonor}
                onChange={updateField}
              />
              Organ donor
            </label>

            <label>
              Notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={updateField}
                rows="4"
                placeholder="Implants, previous surgeries, special care instructions"
              />
            </label>
          </div>

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Medical ID"}
          </button>
        </form>
      </section>
    </main>
  );
}
