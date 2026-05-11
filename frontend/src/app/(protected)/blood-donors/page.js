"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPhoneAlt, FaSearch, FaTrash } from "react-icons/fa";
import {
  deleteMyBloodDonorProfile,
  findBloodDonors,
  getMyBloodDonorProfile,
  requestBloodDonor,
  saveMyBloodDonorProfile,
} from "@/services/bloodDonorService";
import "@/styles/bloodDonors.css";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emptyForm = {
  name: "",
  bloodGroup: "O+",
  city: "",
  phone: "",
  email: "",
  age: "",
  lastDonationDate: "",
  available: true,
  emergencyOnly: false,
  notes: "",
};

const cleanPhone = (phone) => String(phone || "").replace(/[^\d+]/g, "");

export default function BloodDonorFinderPage() {
  const [filters, setFilters] = useState({ bloodGroup: "", city: "", available: "" });
  const [donors, setDonors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const availableDonors = useMemo(
    () => donors.filter((donor) => donor.available).length,
    [donors]
  );

  const loadDonors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await findBloodDonors(filters);
      setDonors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load blood donors");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMyProfile = useCallback(async () => {
    try {
      const data = await getMyBloodDonorProfile();
      const donor = data.donor;

      if (donor) {
        setForm({
          name: donor.name || "",
          bloodGroup: donor.bloodGroup || "O+",
          city: donor.city || "",
          phone: donor.phone || "",
          email: donor.email || "",
          age: donor.age || "",
          lastDonationDate: donor.lastDonationDate ? donor.lastDonationDate.slice(0, 10) : "",
          available: donor.available !== false,
          emergencyOnly: Boolean(donor.emergencyOnly),
          notes: donor.notes || "",
        });
      } else {
        setForm((current) => ({
          ...current,
          name: data.defaults?.name || "",
          email: data.defaults?.email || "",
          phone: data.defaults?.phone || "",
        }));
      }
    } catch {
      // Finder should still work even if the profile defaults cannot load.
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadMyProfile();
      loadDonors();
    });
  }, [loadDonors, loadMyProfile]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveMyBloodDonorProfile(form);
      setMessage("Blood donor profile saved.");
      await loadDonors();
    } catch (err) {
      setError(err.message || "Could not save donor profile");
    } finally {
      setSaving(false);
    }
  };

  const removeProfile = async () => {
    setError("");
    setMessage("");

    try {
      await deleteMyBloodDonorProfile();
      setForm(emptyForm);
      setMessage("Blood donor profile removed.");
      await loadDonors();
    } catch (err) {
      setError(err.message || "Could not remove donor profile");
    }
  };

  const contactDonor = async (donor) => {
    try {
      await requestBloodDonor(donor._id);
      setMessage(`Contact details opened for ${donor.name}.`);
    } catch (err) {
      setError(err.message || "Could not open donor contact");
    }
  };

  return (
    <main className="blood-page">
      <section className="blood-hero">
        <div>
          <span className="eyebrow">Emergency support</span>
          <h1>Blood Donor Finder</h1>
          <p>Find nearby willing donors by blood group and city, or register yourself as an available donor.</p>
        </div>

        <div className="blood-stat">
          <strong>{availableDonors}</strong>
          <span>available donors</span>
        </div>
      </section>

      {error && <p className="blood-alert error">{error}</p>}
      {message && <p className="blood-alert success">{message}</p>}

      <section className="blood-layout">
        <aside className="blood-panel">
          <h2>Find donors</h2>

          <div className="blood-filters">
            <label>
              Blood group
              <select
                value={filters.bloodGroup}
                onChange={(event) => setFilters((current) => ({ ...current, bloodGroup: event.target.value }))}
              >
                <option value="">Any group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </label>

            <label>
              City
              <input
                value={filters.city}
                onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
                placeholder="Mumbai, Delhi, Pune"
              />
            </label>

            <label>
              Availability
              <select
                value={filters.available}
                onChange={(event) => setFilters((current) => ({ ...current, available: event.target.value }))}
              >
                <option value="">Available only</option>
                <option value="all">All donors</option>
              </select>
            </label>

            <button className="btn-primary" onClick={loadDonors}>
              <FaSearch aria-hidden="true" /> Search
            </button>
          </div>

          <form className="donor-form" onSubmit={saveProfile}>
            <h2>Become a donor</h2>

            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>

            <div className="blood-form-grid">
              <label>
                Blood group
                <select value={form.bloodGroup} onChange={(event) => setForm({ ...form, bloodGroup: event.target.value })}>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </label>

              <label>
                Age
                <input value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} placeholder="18-65" />
              </label>
            </div>

            <label>
              City
              <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            </label>

            <label>
              Phone
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>

            <label>
              Email
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>

            <label>
              Last donation date
              <input type="date" value={form.lastDonationDate} onChange={(event) => setForm({ ...form, lastDonationDate: event.target.value })} />
            </label>

            <label className="blood-check">
              <input type="checkbox" checked={form.available} onChange={(event) => setForm({ ...form, available: event.target.checked })} />
              Available for donation
            </label>

            <label className="blood-check">
              <input type="checkbox" checked={form.emergencyOnly} onChange={(event) => setForm({ ...form, emergencyOnly: event.target.checked })} />
              Emergency requests only
            </label>

            <label>
              Notes
              <textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Preferred time, hospital area, constraints" />
            </label>

            <div className="blood-actions">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save donor profile"}
              </button>
              <button className="btn-secondary" type="button" onClick={removeProfile}>
                <FaTrash aria-hidden="true" /> Remove
              </button>
            </div>
          </form>
        </aside>

        <section className="donor-results">
          <div className="section-head">
            <h2>Matching donors</h2>
            <span>{loading ? "Loading..." : `${donors.length} result${donors.length === 1 ? "" : "s"}`}</span>
          </div>

          {donors.length === 0 && !loading ? (
            <p className="empty-state">No donors found for this search.</p>
          ) : (
            donors.map((donor) => (
              <article className="donor-card" key={donor._id}>
                <div className="donor-blood">{donor.bloodGroup}</div>

                <div>
                  <h3>{donor.name}</h3>
                  <p>{donor.city} | {donor.available ? "Available" : "Not available"}</p>
                  <p>{donor.emergencyOnly ? "Emergency requests only" : "Open for regular requests"}</p>
                  {donor.lastDonationDate && (
                    <p>Last donated {new Date(donor.lastDonationDate).toLocaleDateString()}</p>
                  )}
                  {donor.notes && <p>{donor.notes}</p>}
                </div>

                <div className="donor-actions">
                  <a href={`tel:${cleanPhone(donor.phone)}`} onClick={() => contactDonor(donor)}>
                    <FaPhoneAlt aria-hidden="true" /> Call
                  </a>
                  <a href={`sms:${cleanPhone(donor.phone)}?body=${encodeURIComponent(`Blood request for ${donor.bloodGroup}. Please call back if available.`)}`}>
                    SMS
                  </a>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
