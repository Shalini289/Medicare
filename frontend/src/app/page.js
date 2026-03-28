"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import "./globals.css";
// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } })
};
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, scale: 0.96, transition: { duration: 0.3 } }
};

// ── Component ───────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleCheck = async () => {
    if (!patientName || !symptoms) {
      alert("Please fill patient details ❌");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/appointments/check`, {
        patientName, symptoms, report: { duration, painLevel }
      });
      setResponse(res.data);
      const docRes = await axios.get(
        `${API_URL}/api/doctors/${encodeURIComponent(res.data.specialization)}`
      );
      setDoctors(docRes.data);
      if (docRes.data.length > 0) {
        const best = docRes.data.reduce((p, c) => c.rating > p.rating ? c : p);
        setBestDoctor(best);
      }
    } catch (err) {
      console.log("ERROR 👉", err.response?.data);
      alert("Error fetching doctors ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Login first ❌"); router.push("/login"); return; }
    if (!selectedDoctor || !selectedSlot) { alert("Select doctor and slot ❌"); return; }
    try {
      await axios.post(
        `${API_URL}/api/appointments/book`,
        {
          patientName, symptoms,
          doctorId: selectedDoctor._id,
          slot: selectedSlot,
          appointmentDate: new Date().toISOString().split("T")[0]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Appointment Confirmed ✅");
      setSelectedDoctor(null);
      setSelectedSlot("");
    } catch (err) {
      console.log("BOOKING ERROR 👉", err.response?.data);
      alert(err.response?.data?.message || "Booking failed ❌");
    }
  };

  return (
    <>
 

      {/* Aurora background */}
      <div className="aurora">
        <span /><span /><span />
      </div>
      <div className="noise" />

      <div className="page">

        {/* ── HEADER ── */}
        <motion.div
          className="header"
          initial="hidden" animate="show" variants={fadeUp}
        >
          <motion.div className="badge" variants={fadeUp} custom={0}>
            <span className="dot" />
            AI-Powered Healthcare
          </motion.div>
          <motion.h1 className="title" variants={fadeUp} custom={1}>
            Smart Health<br />Assistant
          </motion.h1>
          <motion.p className="subtitle" variants={fadeUp} custom={2}>
            Describe your symptoms and we'll match you<br />with the right specialist instantly.
          </motion.p>
        </motion.div>

        {/* ── FORM CARD ── */}
        <motion.div
          className="card"
          initial="hidden" animate="show" variants={cardVariants}
          transition={{ delay: 0.2 }}
        >
          <div className="card-title">
            <span>Patient Details</span>
            <span className="line" />
          </div>

          <div className="input-wrap">
            <span className="input-icon">👤</span>
            <input className="field" placeholder="Full name" value={patientName}
              onChange={e => setPatientName(e.target.value)} />
          </div>

          <div className="input-wrap">
            <span className="input-icon">🩺</span>
            <input className="field" placeholder="Describe your symptoms" value={symptoms}
              onChange={e => setSymptoms(e.target.value)} />
          </div>

          <div className="row">
            <div className="input-wrap" style={{ margin: 0 }}>
              <span className="input-icon">⏳</span>
              <input className="field" placeholder="Duration (e.g. 3 days)" value={duration}
                onChange={e => setDuration(e.target.value)} />
            </div>
            <div className="input-wrap" style={{ margin: 0 }}>
              <span className="input-icon">🔥</span>
              <input className="field" placeholder="Pain level (1–10)" value={painLevel}
                onChange={e => setPainLevel(e.target.value)} />
            </div>
          </div>

          <motion.button
            className="btn-primary"
            onClick={handleCheck}
            whileTap={{ scale: 0.97 }}
          >
            <span className="btn-shimmer">
              {loading ? (
                <><div className="spinner" /> Analyzing…</>
              ) : (
                <> 🔍 &nbsp;Find Matching Doctors</>
              )}
            </span>
          </motion.button>
        </motion.div>

        <AnimatePresence mode="popLayout">

          {/* ── RESULT ── */}
          {response && (
            <motion.div
              key="result"
              className="card"
              variants={cardVariants} initial="hidden" animate="show" exit="exit"
            >
              <div className="card-title"><span>AI Recommendation</span><span className="line" /></div>
              <div className="result-pills">
                <div className="pill">
                  <span>🏥</span>
                  <span>Specialization: <strong>{response.specialization}</strong></span>
                </div>
                <div className="pill">
                  <span>⏱</span>
                  <span>Est. wait: <strong>{response.waitTime} mins</strong></span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── BEST DOCTOR ── */}
          {bestDoctor && (
            <motion.div
              key="best"
              className="card"
              variants={cardVariants} initial="hidden" animate="show" exit="exit"
            >
              <div className="card-title"><span>Top Rated Match</span><span className="line" /></div>
              <div className="best-card">
                <div className="best-avatar">👨‍⚕️</div>
                <div className="best-info">
                  <div className="name">{bestDoctor.name}</div>
                  <div className="sub">
                    {bestDoctor.specialization} &nbsp;·&nbsp; {bestDoctor.experience} yrs experience &nbsp;·&nbsp; ⭐ {bestDoctor.rating}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── DOCTORS LIST ── */}
          {doctors.length > 0 && (
            <motion.div
              key="doctors"
              className="card"
              variants={cardVariants} initial="hidden" animate="show" exit="exit"
            >
              <div className="card-title"><span>Available Doctors</span><span className="line" /></div>

              {doctors.map((doc, idx) => (
                <motion.div
                  key={doc._id}
                  className={`doc-card ${bestDoctor?._id === doc._id ? "is-best" : ""}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="doc-top">
                    <div>
                      <div className="doc-name">{doc.name}</div>
                      <div className="doc-spec">{doc.specialization}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="rating-badge">★ {doc.rating}</div>
                      {bestDoctor?._id === doc._id && (
                        <div className="best-tag">✦ Top Rated</div>
                      )}
                    </div>
                  </div>

                  <div className="doc-meta">
                    <span className="meta-tag">🎓 {doc.experience} yrs exp</span>
                  </div>

                  <div className="slots">
                    {doc.availableSlots?.map((slot, i) => (
                      <motion.button
                        key={i}
                        className={`slot-btn ${selectedDoctor?._id === doc._id && selectedSlot === slot ? "selected" : ""}`}
                        onClick={() => { setSelectedDoctor(doc); setSelectedSlot(slot); }}
                        whileTap={{ scale: 0.93 }}
                      >
                        {slot}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── STICKY BOOKING BAR ── */}
      <AnimatePresence>
        {selectedDoctor && selectedSlot && (
          <motion.div
            className="sticky-bar"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="sticky-info">
              <div className="doc-n">Dr. {selectedDoctor.name}</div>
              <div className="slot-s">📅 {selectedSlot}</div>
            </div>
            <motion.button
              className="btn-confirm"
              onClick={handleBooking}
              whileTap={{ scale: 0.95 }}
            >
              Confirm Booking →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}