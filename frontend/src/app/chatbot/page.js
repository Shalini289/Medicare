"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles.module.css";

export default function Admin() {
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    experience: "",
    rating: ""
  });

  // 🔐 Check admin + fetch data
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required");
      window.location.href = "/login";
      return;
    }

    fetchAppointments();
  }, []);

  // 📊 Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAppointments(res.data);

    } catch (err) {
      alert("Access denied (Admin only)");
    }
  };

  // ➕ Add doctor
  const addDoctor = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/doctor`,
        doctor,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Doctor added ✅");

      setDoctor({
        name: "",
        specialization: "",
        experience: "",
        rating: ""
      });

    } catch (err) {
      alert("Failed to add doctor");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>👑 Admin Panel</h1>

      {/* ➕ Add Doctor */}
      <div className={styles.card}>
        <h3>➕ Add Doctor</h3>

        <input
          className={styles.input}
          placeholder="Doctor Name"
          value={doctor.name}
          onChange={(e) =>
            setDoctor({ ...doctor, name: e.target.value })
          }
        />

        <input
          className={styles.input}
          placeholder="Specialization"
          value={doctor.specialization}
          onChange={(e) =>
            setDoctor({ ...doctor, specialization: e.target.value })
          }
        />

        <input
          className={styles.input}
          placeholder="Experience (years)"
          value={doctor.experience}
          onChange={(e) =>
            setDoctor({ ...doctor, experience: e.target.value })
          }
        />

        <input
          className={styles.input}
          placeholder="Rating"
          value={doctor.rating}
          onChange={(e) =>
            setDoctor({ ...doctor, rating: e.target.value })
          }
        />

        <button className={styles.button} onClick={addDoctor}>
          Add Doctor
        </button>
      </div>

      {/* 📊 Appointments */}
      <div className={styles.card}>
        <h3>📊 All Appointments</h3>

        {appointments.length === 0 ? (
          <p>No data</p>
        ) : (
          appointments.map((a) => (
            <div key={a._id} className={styles.doctorCard}>
              <p><b>User:</b> {a.userId}</p>
              <p><b>Doctor:</b> {a.doctorId?.name}</p>
              <p><b>Slot:</b> {a.slot}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}