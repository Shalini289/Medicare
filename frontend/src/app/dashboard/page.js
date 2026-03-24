"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles.module.css";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }

    fetchAppointments();
  }, []);

  // 📊 Fetch user appointments
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAppointments(res.data);
    } catch (err) {
      alert("Error loading appointments");
    }

    setLoading(false);
  };

  // ❌ Cancel appointment
  const deleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // refresh UI
      setAppointments((prev) => prev.filter((a) => a._id !== id));

    } catch (err) {
      alert("Failed to cancel");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 My Appointments</h1>

      {/* Loading */}
      {loading && <p style={{ textAlign: "center" }}>⏳ Loading...</p>}

      {/* Empty state */}
      {!loading && appointments.length === 0 && (
        <div className={styles.card}>
          <p style={{ textAlign: "center" }}>
            No appointments yet 😔 <br />
            Book your first appointment!
          </p>
        </div>
      )}

      {/* Appointment list */}
      {appointments.map((appt) => (
        <div key={appt._id} className={styles.card}>
          <p><b>👨‍⚕️ Doctor:</b> {appt.doctorId?.name || appt.doctorId}</p>
          <p><b>🕒 Slot:</b> {appt.slot}</p>
          <p><b>🩺 Symptoms:</b> {appt.symptoms}</p>
          <p><b>📅 Date:</b> {new Date(appt.time).toLocaleString()}</p>

          <button
            className={styles.button}
            onClick={() => deleteAppointment(appt._id)}
          >
            ❌ Cancel Appointment
          </button>
        </div>
      ))}
    </div>
  );
}