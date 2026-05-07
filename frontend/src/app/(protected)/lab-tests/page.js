"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendarCheck, FaFlask, FaTrash } from "react-icons/fa";
import {
  cancelLabBooking,
  createLabBooking,
  getLabBookings,
  getLabTests,
} from "@/services/labTestService";
import "@/styles/labTests.css";

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const emptyBooking = {
  collectionDate: tomorrow(),
  slot: "08:00 - 10:00",
  address: "",
  notes: "",
};

const slots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "16:00 - 18:00",
];

export default function LabTestsPage() {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [booking, setBooking] = useState(emptyBooking);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLabData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [catalog, myBookings] = await Promise.all([
        getLabTests(category),
        getLabBookings(),
      ]);

      setTests(Array.isArray(catalog.tests) ? catalog.tests : []);
      setCategories(Array.isArray(catalog.categories) ? catalog.categories : ["All"]);
      setBookings(Array.isArray(myBookings) ? myBookings : []);
    } catch (err) {
      setError(err.message || "Could not load lab tests");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    queueMicrotask(() => {
      loadLabData();
    });
  }, [loadLabData]);

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? tests.filter((test) =>
          [test.name, test.category, test.description, test.sampleType]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query))
        )
      : tests;
  }, [search, tests]);

  const selectedTests = useMemo(
    () => tests.filter((test) => selected.includes(test._id)),
    [selected, tests]
  );

  const total = selectedTests.reduce((sum, test) => sum + Number(test.price || 0), 0);

  const toggleTest = (testId) => {
    setSelected((current) =>
      current.includes(testId)
        ? current.filter((id) => id !== testId)
        : [...current, testId]
    );
  };

  const updateBooking = (event) => {
    const { name, value } = event.target;
    setBooking((current) => ({ ...current, [name]: value }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createLabBooking({
        ...booking,
        tests: selected,
      });

      setSelected([]);
      setBooking(emptyBooking);
      setMessage("Lab sample collection booked");
      await loadLabData();
    } catch (err) {
      setError(err.message || "Could not book lab tests");
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async (id) => {
    await cancelLabBooking(id);
    await loadLabData();
  };

  return (
    <main className="lab-page">
      <section className="lab-hero">
        <div>
          <span className="eyebrow">Diagnostics</span>
          <h1>Lab Tests</h1>
          <p>Book home sample collection, compare test packages, and track your lab bookings.</p>
        </div>

        <div className="lab-stats">
          <span><strong>{tests.length}</strong> Tests</span>
          <span><strong>{selected.length}</strong> Selected</span>
          <span><strong>Rs {total}</strong> Total</span>
        </div>
      </section>

      <section className="lab-layout">
        <div className="lab-catalog">
          <div className="lab-tools">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tests, sample type, or category"
            />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="empty-state">Loading tests...</p>
          ) : filteredTests.length === 0 ? (
            <p className="empty-state">No lab tests found.</p>
          ) : (
            <div className="lab-grid">
              {filteredTests.map((test) => {
                const isSelected = selected.includes(test._id);

                return (
                  <article className={`lab-card ${isSelected ? "is-selected" : ""}`} key={test._id}>
                    <div className="lab-card__icon">
                      <FaFlask aria-hidden="true" />
                    </div>
                    <div>
                      <span>{test.category}</span>
                      <h2>{test.name}</h2>
                      <p>{test.description}</p>
                    </div>
                    <ul>
                      <li>{test.sampleType} sample</li>
                      <li>{test.reportTime} report</li>
                      <li>{test.fastingRequired ? "Fasting required" : "No fasting"}</li>
                    </ul>
                    <div className="lab-card__footer">
                      <strong>Rs {test.price}</strong>
                      <button onClick={() => toggleTest(test._id)}>
                        {isSelected ? "Remove" : "Add"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="lab-booking-panel">
          <form className="lab-booking-form" onSubmit={submitBooking}>
            <div className="form-title">
              <FaCalendarCheck aria-hidden="true" />
              <h2>Book collection</h2>
            </div>

            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}

            <div className="selected-tests">
              {selectedTests.length === 0 ? (
                <p>No tests selected.</p>
              ) : selectedTests.map((test) => (
                <div key={test._id}>
                  <span>{test.name}</span>
                  <button type="button" onClick={() => toggleTest(test._id)}>
                    <FaTrash aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <label>
              Collection date
              <input
                type="date"
                name="collectionDate"
                value={booking.collectionDate}
                onChange={updateBooking}
                min={tomorrow()}
              />
            </label>

            <label>
              Slot
              <select name="slot" value={booking.slot} onChange={updateBooking}>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </label>

            <label>
              Address
              <textarea
                name="address"
                value={booking.address}
                onChange={updateBooking}
                placeholder="House number, street, city"
                rows="3"
              />
            </label>

            <label>
              Notes
              <input
                name="notes"
                value={booking.notes}
                onChange={updateBooking}
                placeholder="Gate code, preferred call time"
              />
            </label>

            <div className="booking-total">
              <span>Total</span>
              <strong>Rs {total}</strong>
            </div>

            <button className="btn-primary" type="submit" disabled={saving || selected.length === 0}>
              {saving ? "Booking..." : "Confirm booking"}
            </button>
          </form>

          <div className="lab-history">
            <h2>My bookings</h2>

            {bookings.length === 0 ? (
              <p className="empty-state">No lab bookings yet.</p>
            ) : bookings.map((item) => (
              <article className="lab-booking" key={item._id}>
                <div>
                  <span>{item.status.replaceAll("_", " ")}</span>
                  <h3>{new Date(item.collectionDate).toLocaleDateString()} · {item.slot}</h3>
                  <p>{item.tests.map((entry) => entry.test?.name).filter(Boolean).join(", ")}</p>
                  <strong>Rs {item.total}</strong>
                </div>
                {item.status === "scheduled" && (
                  <button onClick={() => cancelBooking(item._id)}>
                    Cancel
                  </button>
                )}
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
