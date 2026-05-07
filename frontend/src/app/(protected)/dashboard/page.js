"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FaBell,
  FaCalendarCheck,
  FaHeartbeat,
  FaIdCard,
  FaStethoscope,
} from "react-icons/fa";
import { getDashboard } from "@/services/dashboardService";
import "@/styles/dashboardHub.css";

const moduleLinks = [
  { title: "Book doctor", href: "/doctors", text: "Find specialists and available slots." },
  { title: "Order medicine", href: "/pharmacy", text: "Search pharmacy inventory and checkout." },
  { title: "Upload reports", href: "/reports", text: "Store and analyze medical reports." },
  { title: "Track vitals", href: "/vitals", text: "Log BP, sugar, pulse, oxygen, and more." },
  { title: "Lab tests", href: "/lab-tests", text: "Book home sample collection." },
  { title: "Care plans", href: "/care-plans", text: "Track daily recovery and wellness tasks." },
  { title: "Vaccinations", href: "/vaccinations", text: "Manage due doses and certificates." },
  { title: "Medical ID", href: "/medical-id", text: "Keep emergency information ready." },
];

const formatVital = (vital) => {
  if (!vital) return "No readings yet";

  const bp = vital.systolic && vital.diastolic ? `${vital.systolic}/${vital.diastolic}` : "--";
  return `BP ${bp} | Pulse ${vital.pulse || "--"} | SpO2 ${vital.oxygen || "--"}%`;
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setDashboard(await getDashboard());
    } catch (err) {
      setError(err.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadDashboard();
    });
  }, [loadDashboard]);

  if (loading) {
    return <main className="dashboard-hub"><p className="empty-state">Loading dashboard...</p></main>;
  }

  if (error) {
    return <main className="dashboard-hub"><p className="form-error">{error}</p></main>;
  }

  const appointment = dashboard?.upcomingAppointment;
  const latestVital = dashboard?.latestVital;

  return (
    <main className="dashboard-hub">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Patient command center</span>
          <h1>Dashboard</h1>
          <p>One place for appointments, alerts, care activity, prescriptions, reports, and next steps.</p>
        </div>

        <Link className="btn-primary" href="/doctors">
          Book appointment
        </Link>
      </section>

      <section className="dashboard-stats">
        {dashboard?.stats?.map((stat) => (
          <Link className="dashboard-stat" href={stat.href} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </Link>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card priority-card">
          <div className="card-title">
            <FaBell aria-hidden="true" />
            <h2>Priority actions</h2>
          </div>

          {dashboard?.actionItems?.length ? (
            <div className="action-list">
              {dashboard.actionItems.map((item) => (
                <Link href={item.href} key={`${item.title}-${item.href}`}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">No urgent actions right now.</p>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-title">
            <FaCalendarCheck aria-hidden="true" />
            <h2>Next appointment</h2>
          </div>

          {appointment ? (
            <div className="appointment-preview">
              <h3>{appointment.doctor?.name || "Doctor appointment"}</h3>
              <p>{appointment.doctor?.specialization || "Consultation"}</p>
              <strong>{appointment.date} at {appointment.time}</strong>
              <Link href="/profile">Manage appointments</Link>
            </div>
          ) : (
            <div className="appointment-preview">
              <p>No upcoming appointment.</p>
              <Link href="/doctors">Find a doctor</Link>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-title">
            <FaHeartbeat aria-hidden="true" />
            <h2>Latest vitals</h2>
          </div>

          <div className="vitals-preview">
            <strong>{formatVital(latestVital)}</strong>
            {dashboard?.vitalAlerts?.length > 0 ? (
              <div className="alert-pills">
                {dashboard.vitalAlerts.map((alert) => (
                  <span key={alert}>{alert}</span>
                ))}
              </div>
            ) : (
              <p>No vital alerts detected.</p>
            )}
            <Link href="/vitals">Open vitals</Link>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title">
            <FaIdCard aria-hidden="true" />
            <h2>Medical ID</h2>
          </div>

          <div className="medical-id-preview">
            <strong>{dashboard?.medicalProfileCompletion || 0}% complete</strong>
            <div className="progress-track">
              <span style={{ width: `${dashboard?.medicalProfileCompletion || 0}%` }} />
            </div>
            <Link href="/medical-id">Update Medical ID</Link>
          </div>
        </div>

        <div className="dashboard-card notifications-preview">
          <div className="card-title">
            <FaBell aria-hidden="true" />
            <h2>Recent notifications</h2>
          </div>

          {dashboard?.latestNotifications?.length ? (
            dashboard.latestNotifications.map((notification) => (
              <article key={notification._id}>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </article>
            ))
          ) : (
            <p className="empty-state">No notifications yet.</p>
          )}

          <Link href="/notifications">View all notifications</Link>
        </div>

        <div className="dashboard-card module-card">
          <div className="card-title">
            <FaStethoscope aria-hidden="true" />
            <h2>Care modules</h2>
          </div>

          <div className="module-grid">
            {moduleLinks.map((item) => (
              <Link href={item.href} key={item.href}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
