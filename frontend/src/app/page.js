"use client";

import { useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import { motion } from "framer-motion";

export default function Home() {
  const [patientName, setPatientName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [painLevel, setPainLevel] = useState("");

  const [response, setResponse] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [bestDoctor, setBestDoctor] = useState(null);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔍 Check doctor
  const handleCheck = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/check`,
        {
          patientName,
          symptoms,
          report: { duration, painLevel }
        }
      );

      setResponse(res.data);

      const docRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/${encodeURIComponent(
          res.data.specialization
        )}`
      );

      setDoctors(docRes.data);

      if (docRes.data.length > 0) {
        const best = docRes.data.reduce((prev, curr) =>
          curr.rating > prev.rating ? curr : prev
        );
        setBestDoctor(best);
      }

    } catch (err) {
      alert("Error fetching data");
    }

    setLoading(false);
  };

  // 📅 Booking
  const handleBooking = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login first");
      window.location.href = "/login";
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/book`,
        {
          patientName,
          symptoms,
          report: { duration, painLevel },
          doctorId: selectedDoctor._id,
          slot: selectedSlot
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Appointment Confirmed ✅");

    } catch (err) {
      alert("Booking failed");
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HERO */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 className={styles.title}>🩺 Smart Healthcare</h1>
        <p style={{ opacity: 0.8 }}>
          AI-powered doctor recommendation & appointment system
        </p>
      </div>

      {/* FORM */}
      <div className={styles.card}>
        <h3>📝 Patient Details</h3>

        <input
          className={styles.input}
          placeholder="👤 Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="🩺 Symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="⏳ Duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="🔥 Pain Level (1-10)"
          value={painLevel}
          onChange={(e) => setPainLevel(e.target.value)}
        />

        <button className={styles.button} onClick={handleCheck}>
          {loading ? "Checking..." : "🔍 Find Doctors"}
        </button>
      </div>

      {/* RECOMMENDATION */}
      {response && (
        <div className={styles.card}>
          <h3>📋 Recommendation</h3>
          <p><b>Specialization:</b> {response.specialization}</p>
          <p><b>Wait Time:</b> {response.waitTime} mins</p>
        </div>
      )}

      {/* BEST DOCTOR */}
      {bestDoctor && (
        <div className={styles.card}>
          <h3>⭐ Best Doctor</h3>
          <p><b>{bestDoctor.name}</b></p>
          <p>Experience: {bestDoctor.experience} yrs</p>
          <p>⭐ {bestDoctor.rating}</p>
        </div>
      )}

      {/* DOCTOR LIST */}
      {doctors.length > 0 && (
        <div className={styles.card}>
          <h3>👨‍⚕️ Select Doctor & Slot</h3>

          {doctors.map((doc) => (
            <div key={doc._id} className={styles.doctorCard}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                <h4 className={styles.doctorTitle}>{doc.name}</h4>
                  <p>🧠 {doc.specialization}</p>
                  <p>🎓 {doc.experience} yrs</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p>⭐ {doc.rating}</p>
                  {bestDoctor?._id === doc._id && (
                    <span style={{ color: "#00ffcc" }}>Top Rated</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "10px" }}>
                {doc.availableSlots?.map((slot, i) => (
                  <button
                    key={i}
                    className={`${styles.slotBtn} ${
                      selectedDoctor?._id === doc._id &&
                      selectedSlot === slot
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setSelectedSlot(slot);
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STICKY BOOKING */}
      {selectedDoctor && selectedSlot && (
        <div className={styles.stickyBar}>
          <span>
            {selectedDoctor.name} • {selectedSlot}
          </span>

          <button className={styles.button} onClick={handleBooking}>
            📅 Confirm Booking
          </button>
        </div>
      )}
    </motion.div>
  );
}