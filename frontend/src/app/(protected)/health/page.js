"use client";

import Link from "next/link";

export default function HealthPage() {
  return (
    <div className="health-page">
      <h1>Health Dashboard</h1>

      <div className="card health-actions">
        <div>
          <h3>Patient Dashboard</h3>
          <p>Review alerts, upcoming care, and all modules in one place.</p>
        </div>
        <Link className="btn-primary" href="/dashboard">
          Open dashboard
        </Link>
      </div>

      <div className="card health-actions">
        <div>
          <h3>Vitals Tracker</h3>
          <p>Log BP, sugar, oxygen, temperature, pulse, and weight readings.</p>
        </div>
        <Link className="btn-primary" href="/vitals">
          Open vitals
        </Link>
      </div>

      <div className="card health-actions">
        <div>
          <h3>Medical ID</h3>
          <p>Keep allergies, emergency contacts, and care notes ready.</p>
        </div>
        <Link className="btn-primary" href="/medical-id">
          Open Medical ID
        </Link>
      </div>

      <div className="card health-actions">
        <div>
          <h3>Vaccinations</h3>
          <p>Track upcoming, completed, and overdue immunizations.</p>
        </div>
        <Link className="btn-primary" href="/vaccinations">
          Open vaccines
        </Link>
      </div>

      <div className="card">
        <h3>Care Modules</h3>
        <p>Use vitals, prescriptions, lab bookings, reminders, vaccinations, and medical ID to keep your care data organized.</p>
      </div>
    </div>
  );
}
