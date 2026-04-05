"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/admin.module.css";


const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const cardAnim = (delay = 0) => ({
  initial: { opacity: 0, y: 28, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
});
const rowAnim = {
  hidden: { opacity: 0, x: -16 },
  show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Admin() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(false);
  const [doctor, setDoctor] = useState({ name: "", specialization: "", experience: "", rating: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/appointments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data);
    } catch {
      alert("Access denied (Admin only)");
    } finally {
      setLoading(false);
    }
  };

  const addDoctor = async () => {
    try {
      setAdding(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/doctor`,
        doctor,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctor({ name: "", specialization: "", experience: "", rating: "" });
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch {
      alert("Failed to add doctor");
    } finally {
      setAdding(false);
    }
  };

  const canAdd = doctor.name && doctor.specialization && doctor.experience && doctor.rating;

  return (
    <>
 
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div className="header" variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}>
            <span className="dot" /> Admin Panel
          </motion.div>
          <motion.h1 className="title" variants={fadeUp}>Control Centre</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>
            Manage doctors and monitor all appointments.
          </motion.p>
        </motion.div>

        {/* Stats */}
        {!loading && (
          <motion.div
            className="stats"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <div className="stat-card">
              <div className="stat-value" style={{ color: "var(--gold)" }}>{appointments.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "var(--accent)" }}>
                {new Set(appointments.map(a => a.doctorId?.name)).size}
              </div>
              <div className="stat-label">Doctors Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "var(--accent2)" }}>
                {new Set(appointments.map(a => a.userId)).size}
              </div>
              <div className="stat-label">Unique Patients</div>
            </div>
          </motion.div>
        )}

        {/* Two-col grid */}
        <div className="grid">

          {/* Add Doctor */}
          <motion.div className="card" {...cardAnim(0.3)}>
            <div className="card-title"><span>Add Doctor</span><span className="line" /></div>

            <AnimatePresence>
              {toast && (
                <motion.div className="toast"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  ✅ Doctor added successfully
                </motion.div>
              )}
            </AnimatePresence>

            {[
              { key: "name",           icon: "👨‍⚕️", placeholder: "Full name" },
              { key: "specialization", icon: "🧠", placeholder: "Specialization" },
              { key: "experience",     icon: "🎓", placeholder: "Experience (years)" },
              { key: "rating",         icon: "⭐", placeholder: "Rating (e.g. 4.8)" },
            ].map(({ key, icon, placeholder }, i) => (
              <motion.div className="input-wrap" key={key}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}>
                <span className="input-icon">{icon}</span>
                <input
                  className="field"
                  placeholder={placeholder}
                  value={doctor[key]}
                  onChange={e => setDoctor({ ...doctor, [key]: e.target.value })}
                />
              </motion.div>
            ))}

            <motion.button
              className="btn-add"
              onClick={addDoctor}
              disabled={adding || !canAdd}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              <span className="btn-inner">
                {adding ? <><div className="spinner" /> Adding…</> : <>＋ Add Doctor</>}
              </span>
            </motion.button>
          </motion.div>

          {/* Appointments */}
          <motion.div className="card" {...cardAnim(0.4)}>
            <div className="card-title"><span>All Appointments</span><span className="line" /></div>

            {/* Skeletons */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[1, 2, 3].map(i => (
                  <motion.div key={i} className="skeleton"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 }} />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && appointments.length === 0 && (
              <div className="empty">No appointments yet.</div>
            )}

            {/* List */}
            {!loading && appointments.length > 0 && (
              <div className="appt-list">
                <AnimatePresence>
                  {appointments.map((a, i) => (
                    <motion.div
                      key={a._id}
                      className="appt-row"
                      custom={i}
                      variants={rowAnim}
                      initial="hidden"
                      animate="show"
                    >
                      <div className="appt-top">
                        <div className="appt-doc">{a.doctorId?.name || "—"}</div>
                        <span className="slot-pill">{a.slot}</span>
                      </div>
                      <div className="appt-user">👤 {a.userId}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </>
  );
}