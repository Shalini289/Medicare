"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPhoneAlt, FaPlus, FaSms, FaTrash } from "react-icons/fa";
import {
  getEmergencyContacts,
  saveEmergencyContacts,
  sendEmergencyAlert,
} from "@/services/medicalProfileService";
import "@/styles/emergencyContacts.css";

const emptyContact = {
  name: "",
  relation: "",
  phone: "",
};

const sanitizePhone = (phone) => String(phone || "").replace(/[^\d+]/g, "");

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState([{ ...emptyContact }]);
  const [medicalSummary, setMedicalSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alerting, setAlerting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const validContacts = useMemo(
    () => contacts.filter((contact) => contact.name?.trim() || contact.phone?.trim()),
    [contacts]
  );

  const primaryContact = validContacts[0];

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getEmergencyContacts();
      setContacts(data.contacts?.length ? data.contacts : [{ ...emptyContact }]);
      setMedicalSummary(data.medicalSummary || {});
    } catch (err) {
      setError(err.message || "Could not load emergency contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadContacts();
    });
  }, [loadContacts]);

  const updateContact = (index, field, value) => {
    setContacts((current) =>
      current.map((contact, itemIndex) =>
        itemIndex === index ? { ...contact, [field]: value } : contact
      )
    );
  };

  const addContact = () => {
    setContacts((current) => [...current, { ...emptyContact }]);
  };

  const removeContact = (index) => {
    setContacts((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [{ ...emptyContact }];
    });
  };

  const saveContacts = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await saveEmergencyContacts(contacts);
      setContacts(data.contacts?.length ? data.contacts : [{ ...emptyContact }]);
      setMedicalSummary(data.medicalSummary || {});
      setMessage("Emergency contacts saved");
    } catch (err) {
      setError(err.message || "Could not save emergency contacts");
    } finally {
      setSaving(false);
    }
  };

  const triggerAlert = async () => {
    setAlerting(true);
    setError("");
    setMessage("");

    try {
      let location = "";

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
            })
          );
          location = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
        } catch {
          location = "";
        }
      }

      await sendEmergencyAlert({ location });
      setMessage("Emergency alert recorded. Use call or SMS to contact your emergency person now.");
    } catch (err) {
      setError(err.message || "Could not record emergency alert");
    } finally {
      setAlerting(false);
    }
  };

  const smsText = encodeURIComponent(
    `Emergency. I need help. Blood group: ${medicalSummary.bloodGroup || "not set"}.`
  );

  return (
    <main className="emergency-page">
      <section className="emergency-hero">
        <div>
          <span className="eyebrow">Emergency contact system</span>
          <h1>Emergency Contacts</h1>
          <p>Keep trusted contacts ready, share key medical details, and record an emergency alert instantly.</p>
        </div>

        <button className="sos-button" onClick={triggerAlert} disabled={alerting || validContacts.length === 0}>
          {alerting ? "Sending..." : "SOS Alert"}
        </button>
      </section>

      {error && <p className="emergency-error">{error}</p>}
      {message && <p className="emergency-success">{message}</p>}

      <section className="emergency-grid">
        <aside className="emergency-card">
          <h2>Quick actions</h2>

          {primaryContact ? (
            <div className="primary-contact">
              <span>Primary contact</span>
              <strong>{primaryContact.name}</strong>
              <p>{primaryContact.relation || "Emergency contact"}</p>
              <p>{primaryContact.phone}</p>

              <div className="quick-actions">
                <a href={`tel:${sanitizePhone(primaryContact.phone)}`}>
                  <FaPhoneAlt aria-hidden="true" /> Call
                </a>
                <a href={`sms:${sanitizePhone(primaryContact.phone)}?body=${smsText}`}>
                  <FaSms aria-hidden="true" /> SMS
                </a>
              </div>
            </div>
          ) : (
            <p className="empty-state">Add at least one emergency contact to enable quick actions.</p>
          )}

          <div className="medical-summary">
            <h3>Medical summary</h3>
            <dl>
              <div>
                <dt>Blood group</dt>
                <dd>{medicalSummary.bloodGroup || "Not set"}</dd>
              </div>
              <div>
                <dt>Allergies</dt>
                <dd>{medicalSummary.allergies?.join(", ") || "None added"}</dd>
              </div>
              <div>
                <dt>Conditions</dt>
                <dd>{medicalSummary.conditions?.join(", ") || "None added"}</dd>
              </div>
              <div>
                <dt>Current medications</dt>
                <dd>{medicalSummary.currentMedications?.join(", ") || "None added"}</dd>
              </div>
              <div>
                <dt>Primary doctor</dt>
                <dd>{medicalSummary.primaryDoctor || "Not set"}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <form className="emergency-form" onSubmit={saveContacts}>
          <div className="section-head">
            <h2>Contact list</h2>
            <button type="button" onClick={addContact}>
              <FaPlus aria-hidden="true" /> Add contact
            </button>
          </div>

          {loading && <p className="empty-state">Loading contacts...</p>}

          {contacts.map((contact, index) => (
            <div className="emergency-contact-row" key={`${index}-${contact.phone}`}>
              <label>
                Name
                <input
                  value={contact.name}
                  onChange={(event) => updateContact(index, "name", event.target.value)}
                  placeholder="Contact name"
                />
              </label>

              <label>
                Relation
                <input
                  value={contact.relation}
                  onChange={(event) => updateContact(index, "relation", event.target.value)}
                  placeholder="Spouse, parent, friend"
                />
              </label>

              <label>
                Phone
                <input
                  value={contact.phone}
                  onChange={(event) => updateContact(index, "phone", event.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>

              <button type="button" title="Remove contact" onClick={() => removeContact(index)}>
                <FaTrash aria-hidden="true" />
              </button>
            </div>
          ))}

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Emergency Contacts"}
          </button>
        </form>
      </section>
    </main>
  );
}
