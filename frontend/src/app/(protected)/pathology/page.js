"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaFlask, FaSave, FaVial } from "react-icons/fa";
import {
  createPathologyTest,
  getPathologyDashboard,
  updatePathologyBooking,
  updatePathologyTest,
} from "@/services/labTestService";
import { getCurrentUser } from "@/utils/auth";

const emptyTestForm = {
  name: "",
  category: "General",
  price: "",
  sampleType: "Blood",
  fastingRequired: false,
  reportTime: "24 hours",
  description: "",
  active: true,
};

const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPatientName = (booking) =>
  booking.user?.name || booking.user?.email || "Patient";

export default function PathologyPage() {
  const router = useRouter();
  const [accessStatus, setAccessStatus] = useState("checking");
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [tests, setTests] = useState([]);
  const [activeTab, setActiveTab] = useState("bookings");
  const [statusDrafts, setStatusDrafts] = useState({});
  const [testForm, setTestForm] = useState(emptyTestForm);
  const [editingTestId, setEditingTestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPathologyDashboard();
      setStats(data.stats || {});
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      setTests(Array.isArray(data.tests) ? data.tests : []);
    } catch (err) {
      setError(err.message || "Could not load pathology portal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const user = getCurrentUser();

      if (user?.role !== "pathology") {
        setAccessStatus("denied");
        router.replace("/dashboard");
        return;
      }

      setAccessStatus("allowed");
      loadDashboard();
    });
  }, [loadDashboard, router]);

  const getDraft = (booking) => statusDrafts[booking._id] || {
    status: booking.status,
    pathologyNotes: booking.pathologyNotes || "",
    reportSummary: booking.reportSummary || "",
  };

  const updateDraft = (bookingId, field, value) => {
    setStatusDrafts((current) => ({
      ...current,
      [bookingId]: {
        ...(current[bookingId] || {}),
        [field]: value,
      },
    }));
  };

  const saveBooking = async (booking) => {
    try {
      setError("");
      setMessage("");
      await updatePathologyBooking(booking._id, getDraft(booking));
      setMessage("Lab booking updated.");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not update booking");
    }
  };

  const saveTest = async (event) => {
    event.preventDefault();

    if (!testForm.name.trim()) {
      setError("Test name is required.");
      return;
    }

    try {
      setError("");
      setMessage("");
      const payload = {
        ...testForm,
        name: testForm.name.trim(),
        price: Number(testForm.price || 0),
      };

      if (editingTestId) {
        await updatePathologyTest(editingTestId, payload);
        setMessage("Lab test updated.");
      } else {
        await createPathologyTest(payload);
        setMessage("Lab test added.");
      }

      setTestForm(emptyTestForm);
      setEditingTestId("");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not save lab test");
    }
  };

  const editTest = (test) => {
    setEditingTestId(test._id);
    setTestForm({
      name: test.name || "",
      category: test.category || "General",
      price: test.price || "",
      sampleType: test.sampleType || "Blood",
      fastingRequired: Boolean(test.fastingRequired),
      reportTime: test.reportTime || "24 hours",
      description: test.description || "",
      active: Boolean(test.active),
    });
    setActiveTab("tests");
  };

  if (accessStatus !== "allowed") {
    return (
      <main className="pathology-page">
        <p className="pathology-alert">
          {accessStatus === "denied" ? "Pathology access only. Redirecting..." : "Checking pathology access..."}
        </p>
      </main>
    );
  }

  return (
    <main className="pathology-page">
      <section className="pathology-hero">
        <div>
          <span className="eyebrow">Pathology workspace</span>
          <h1>Pathology Portal</h1>
          <p>Manage lab bookings, sample collection, report readiness, and test catalog from one lab operations view.</p>
        </div>
        <button className="btn-primary" onClick={loadDashboard}>Refresh</button>
      </section>

      {error && <p className="pathology-alert error">{error}</p>}
      {message && <p className="pathology-alert success">{message}</p>}
      {loading && <p className="pathology-alert">Loading pathology data...</p>}

      <section className="pathology-stats">
        <div><strong>{stats.totalBookings || 0}</strong><span>Total bookings</span></div>
        <div><strong>{stats.scheduled || 0}</strong><span>Scheduled</span></div>
        <div><strong>{stats.sampleCollected || 0}</strong><span>Samples collected</span></div>
        <div><strong>{stats.reportReady || 0}</strong><span>Reports ready</span></div>
        <div><strong>{stats.activeTests || 0}</strong><span>Active tests</span></div>
        <div><strong>{formatCurrency(stats.revenue)}</strong><span>Lab revenue</span></div>
      </section>

      <div className="pathology-tabs">
        <button className={activeTab === "bookings" ? "is-active" : ""} onClick={() => setActiveTab("bookings")}>
          Bookings
        </button>
        <button className={activeTab === "tests" ? "is-active" : ""} onClick={() => setActiveTab("tests")}>
          Test catalog
        </button>
      </div>

      {activeTab === "bookings" && (
        <section className="pathology-section">
          <div className="pathology-section-title">
            <FaVial aria-hidden="true" />
            <h2>Sample and report workflow</h2>
          </div>

          {bookings.length === 0 && <p className="empty-state">No lab bookings found.</p>}

          <div className="pathology-booking-list">
            {bookings.map((booking) => {
              const draft = getDraft(booking);
              const testNames = booking.tests
                ?.map((item) => item.test?.name || "Lab test")
                .join(", ");

              return (
                <article className="pathology-card" key={booking._id}>
                  <div className="pathology-card__head">
                    <div>
                      <h3>{getPatientName(booking)}</h3>
                      <p>{booking.user?.phone || booking.user?.email || "No contact"} | {formatDate(booking.collectionDate)} | {booking.slot}</p>
                    </div>
                    <span className={`pathology-status ${booking.status}`}>{booking.status.replace("_", " ")}</span>
                  </div>

                  <p>{testNames || "No tests listed"}</p>
                  <p>{booking.address}</p>

                  <div className="pathology-form-grid">
                    <label>
                      Status
                      <select value={draft.status} onChange={(event) => updateDraft(booking._id, "status", event.target.value)}>
                        <option value="scheduled">Scheduled</option>
                        <option value="sample_collected">Sample collected</option>
                        <option value="report_ready">Report ready</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </label>
                    <label>
                      Pathology notes
                      <input value={draft.pathologyNotes} onChange={(event) => updateDraft(booking._id, "pathologyNotes", event.target.value)} placeholder="Sample condition, collector notes" />
                    </label>
                    <label className="pathology-wide">
                      Report summary
                      <textarea value={draft.reportSummary} onChange={(event) => updateDraft(booking._id, "reportSummary", event.target.value)} placeholder="Short report/result note for patient" />
                    </label>
                  </div>

                  <button className="btn-primary" onClick={() => saveBooking(booking)}>
                    <FaSave aria-hidden="true" /> Save booking
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "tests" && (
        <section className="pathology-section">
          <div className="pathology-section-title">
            <FaFlask aria-hidden="true" />
            <h2>Lab test catalog</h2>
          </div>

          <form className="pathology-test-form" onSubmit={saveTest}>
            <input value={testForm.name} onChange={(event) => setTestForm((current) => ({ ...current, name: event.target.value }))} placeholder="Test name" />
            <input value={testForm.category} onChange={(event) => setTestForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" />
            <input type="number" min="0" value={testForm.price} onChange={(event) => setTestForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" />
            <input value={testForm.sampleType} onChange={(event) => setTestForm((current) => ({ ...current, sampleType: event.target.value }))} placeholder="Sample type" />
            <input value={testForm.reportTime} onChange={(event) => setTestForm((current) => ({ ...current, reportTime: event.target.value }))} placeholder="Report time" />
            <label className="pathology-checkbox">
              <input type="checkbox" checked={testForm.fastingRequired} onChange={(event) => setTestForm((current) => ({ ...current, fastingRequired: event.target.checked }))} />
              Fasting required
            </label>
            <label className="pathology-checkbox">
              <input type="checkbox" checked={testForm.active} onChange={(event) => setTestForm((current) => ({ ...current, active: event.target.checked }))} />
              Active
            </label>
            <textarea value={testForm.description} onChange={(event) => setTestForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
            <button className="btn-primary" type="submit">{editingTestId ? "Update test" : "Add test"}</button>
            {editingTestId && <button className="btn-secondary" type="button" onClick={() => { setEditingTestId(""); setTestForm(emptyTestForm); }}>Cancel edit</button>}
          </form>

          <div className="pathology-test-list">
            {tests.map((test) => (
              <article className="pathology-card" key={test._id}>
                <div className="pathology-card__head">
                  <div>
                    <h3>{test.name}</h3>
                    <p>{test.category} | {test.sampleType} | {test.reportTime}</p>
                  </div>
                  <span className={`pathology-status ${test.active ? "active" : "cancelled"}`}>{test.active ? "active" : "inactive"}</span>
                </div>
                <p>{formatCurrency(test.price)} | {test.fastingRequired ? "Fasting required" : "No fasting"}</p>
                <p>{test.description || "No description"}</p>
                <button className="btn-secondary" onClick={() => editTest(test)}>Edit test</button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
