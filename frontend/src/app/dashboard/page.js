"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #06080f;
    --glass:   rgba(255,255,255,0.04);
    --border:  rgba(255,255,255,0.08);
    --accent:  #4fffb0;
    --accent2: #00b4ff;
    --danger:  #ff6b6b;
    --text:    #e8ecf4;
    --muted:   rgba(232,236,244,0.45);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  /* Aurora */
  .aurora { position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0; }
  .aurora span {
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.13;
    animation:drift 18s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:600px;height:600px;background:var(--accent2);top:-200px;left:-150px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent);bottom:-150px;right:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:#818cf8;top:45%;left:52%;animation-delay:-14s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(50px,70px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* Page */
  .page {
    position:relative;z-index:1;
    max-width:720px;margin:0 auto;
    padding:60px 20px 80px;
  }

  /* Header */
  .header { margin-bottom:48px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent);font-weight:600;margin-bottom:20px;
  }
  .badge .dot {
    width:6px;height:6px;border-radius:50%;background:var(--accent);
    animation:pulse-dot 2s infinite;
  }
  @keyframes pulse-dot{
    0%,100%{box-shadow:0 0 0 0 rgba(79,255,176,0.6);}
    50%{box-shadow:0 0 0 6px rgba(79,255,176,0);}
  }
  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(34px,5vw,52px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Stats row */
  .stats {
    display:grid;grid-template-columns:repeat(3,1fr);gap:14px;
    margin-bottom:36px;
  }
  .stat-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:16px;padding:18px 20px;
    position:relative;overflow:hidden;
  }
  .stat-card::before{
    content:'';position:absolute;inset:0;border-radius:16px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);
    pointer-events:none;
  }
  .stat-value {
    font-family:'Syne',sans-serif;font-size:28px;font-weight:800;
    color:var(--accent);line-height:1;margin-bottom:6px;
  }
  .stat-label { font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted); }

  /* Section label */
  .section-label {
    font-family:'Syne',sans-serif;
    font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    color:var(--muted);margin-bottom:16px;
    display:flex;align-items:center;gap:10px;
  }
  .section-label .line{flex:1;height:1px;background:var(--border);}

  /* Appointment card */
  .appt-card {
    background:var(--glass);
    border:1px solid var(--border);
    border-radius:18px;padding:22px 24px;
    margin-bottom:14px;
    position:relative;overflow:hidden;
    transition:border-color .25s;
  }
  .appt-card::before{
    content:'';position:absolute;inset:0;border-radius:18px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 55%);
    pointer-events:none;
  }
  .appt-card:hover{border-color:rgba(79,255,176,0.2);}

  .appt-top {
    display:flex;justify-content:space-between;align-items:flex-start;
    margin-bottom:16px;gap:12px;
  }
  .doctor-block { display:flex;align-items:center;gap:12px; }
  .doc-avatar {
    width:44px;height:44px;border-radius:12px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(79,255,176,0.2),rgba(0,180,255,0.2));
    border:1px solid rgba(79,255,176,0.2);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }
  .doc-name {
    font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:3px;
  }
  .doc-slot {
    font-size:12px;color:var(--accent);font-weight:500;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.15);
    border-radius:6px;padding:2px 8px;display:inline-block;
  }

  /* Meta grid */
  .appt-meta {
    display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;
  }
  .meta-item {
    background:rgba(255,255,255,0.03);border:1px solid var(--border);
    border-radius:10px;padding:10px 14px;
  }
  .meta-key {
    font-size:10px;letter-spacing:.08em;text-transform:uppercase;
    color:var(--muted);margin-bottom:4px;
  }
  .meta-val { font-size:13px;font-weight:500; }

  /* Cancel button */
  button.btn-cancel {
    background:rgba(255,107,107,0.08);
    border:1px solid rgba(255,107,107,0.2);
    border-radius:10px;
    padding:10px 18px;
    color:var(--danger);
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;
    cursor:pointer;
    transition:background .2s,border-color .2s,transform .2s;
  }
  button.btn-cancel:hover{
    background:rgba(255,107,107,0.15);
    border-color:rgba(255,107,107,0.4);
    transform:translateY(-1px);
  }
  button.btn-cancel:active{transform:translateY(0);}

  /* Loading skeleton */
  .skeleton {
    background:var(--glass);border:1px solid var(--border);
    border-radius:18px;padding:22px 24px;margin-bottom:14px;
    height:160px;
    background: linear-gradient(90deg,
      rgba(255,255,255,0.03) 0%,
      rgba(255,255,255,0.07) 50%,
      rgba(255,255,255,0.03) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.6s infinite;
  }
  @keyframes shimmer{
    0%{background-position:200% 0;}
    100%{background-position:-200% 0;}
  }

  /* Empty state */
  .empty {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:56px 32px;
    text-align:center;
  }
  .empty-icon { font-size:48px;margin-bottom:16px; }
  .empty-title {
    font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:8px;
  }
  .empty-sub { color:var(--muted);font-size:14px;line-height:1.6;margin-bottom:24px; }
  a.btn-book {
    display:inline-block;
    background:var(--accent);color:#06080f;
    border-radius:10px;padding:12px 24px;
    font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;
    text-decoration:none;
    transition:transform .2s,box-shadow .2s;
  }
  a.btn-book:hover{
    transform:translateY(-2px);
    box-shadow:0 10px 32px rgba(79,255,176,0.3);
  }

  @media(max-width:520px){
    .stats{grid-template-columns:1fr 1fr;}
    .stats .stat-card:last-child{grid-column:1/-1;}
    .appt-meta{grid-template-columns:1fr;}
  }
`;

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, x: -40, scale: 0.95, transition: { duration: 0.3 } },
};

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data);
    } catch (err) {
      alert("Error loading appointments");
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      setCancelling(id);
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert("Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = appointments.filter(a => new Date(a.time) >= new Date());
  const past = appointments.length - upcoming.length;

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div className="header" variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}>
            <span className="dot" /> Dashboard
          </motion.div>
          <motion.h1 className="title" variants={fadeUp}>My Appointments</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>
            Track, manage and cancel your bookings.
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
              <div className="stat-value">{appointments.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "var(--accent2)" }}>{upcoming.length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "var(--muted)" }}>{past}</div>
              <div className="stat-label">Past</div>
            </div>
          </motion.div>
        )}

        {/* Section label */}
        {!loading && appointments.length > 0 && (
          <motion.div
            className="section-label"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <span>All Bookings</span><span className="line" />
          </motion.div>
        )}

        {/* Skeletons */}
        {loading && [1, 2, 3].map(i => (
          <motion.div
            key={i} className="skeleton"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
          />
        ))}

        {/* Empty state */}
        {!loading && appointments.length === 0 && (
          <motion.div
            className="empty"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="empty-icon">🩺</div>
            <div className="empty-title">No appointments yet</div>
            <div className="empty-sub">
              You haven't booked any appointments.<br />Find a doctor and get started.
            </div>
            <a className="btn-book" href="/">Book Appointment →</a>
          </motion.div>
        )}

        {/* Appointment cards */}
        <AnimatePresence mode="popLayout">
          {appointments.map((appt, i) => (
            <motion.div
              key={appt._id}
              className="appt-card"
              variants={cardAnim}
              custom={i}
              initial="hidden"
              animate="show"
              exit="exit"
              layout
            >
              <div className="appt-top">
                <div className="doctor-block">
                  <div className="doc-avatar">👨‍⚕️</div>
                  <div>
                    <div className="doc-name">{appt.doctorId?.name || appt.doctorId}</div>
                    <span className="doc-slot">{appt.slot}</span>
                  </div>
                </div>
                <motion.button
                  className="btn-cancel"
                  onClick={() => deleteAppointment(appt._id)}
                  disabled={cancelling === appt._id}
                  whileTap={{ scale: 0.95 }}
                >
                  {cancelling === appt._id ? "Cancelling…" : "✕ Cancel"}
                </motion.button>
              </div>

              <div className="appt-meta">
                <div className="meta-item">
                  <div className="meta-key">Symptoms</div>
                  <div className="meta-val">{appt.symptoms || "—"}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-key">Date & Time</div>
                  <div className="meta-val">{new Date(appt.time).toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </>
  );
}