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
    --gold:    #ffc800;
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
    position:absolute;border-radius:50%;filter:blur(130px);opacity:0.13;
    animation:drift 18s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:580px;height:580px;background:var(--gold);top:-200px;right:-120px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent);bottom:-140px;left:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:#818cf8;top:45%;left:50%;animation-delay:-14s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,65px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* Page */
  .page {
    position:relative;z-index:1;
    max-width:820px;margin:0 auto;
    padding:60px 20px 80px;
  }

  /* Header */
  .header { margin-bottom:48px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.22);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--gold);font-weight:600;margin-bottom:20px;
  }
  .badge .dot {
    width:6px;height:6px;border-radius:50%;background:var(--gold);
    animation:pulse-dot 2s infinite;
  }
  @keyframes pulse-dot{
    0%,100%{box-shadow:0 0 0 0 rgba(255,200,0,0.6);}
    50%{box-shadow:0 0 0 6px rgba(255,200,0,0);}
  }
  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(34px,5vw,52px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--gold) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Stats row */
  .stats {
    display:grid;grid-template-columns:repeat(3,1fr);gap:14px;
    margin-bottom:40px;
  }
  .stat-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:16px;padding:20px;
    position:relative;overflow:hidden;
  }
  .stat-card::before{
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);
    pointer-events:none;
  }
  .stat-value {
    font-family:'Syne',sans-serif;font-size:30px;font-weight:800;
    line-height:1;margin-bottom:6px;
  }
  .stat-label { font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted); }

  /* Two-col layout */
  .grid { display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start; }
  @media(max-width:620px){ .grid{grid-template-columns:1fr;} }

  /* Card */
  .card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:28px;
    position:relative;overflow:hidden;
  }
  .card::before{
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);
    pointer-events:none;
  }
  .card-title {
    font-family:'Syne',sans-serif;
    font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    color:var(--muted);margin-bottom:20px;
    display:flex;align-items:center;gap:10px;
  }
  .card-title .line{flex:1;height:1px;background:var(--border);}

  /* Inputs */
  .input-wrap { position:relative;margin-bottom:12px; }
  .input-icon {
    position:absolute;left:14px;top:50%;transform:translateY(-50%);
    font-size:14px;pointer-events:none;
  }
  input.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:11px;
    padding:12px 14px 12px 40px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;
    outline:none;transition:border-color .25s,box-shadow .25s,background .25s;
  }
  input.field::placeholder{color:rgba(255,255,255,0.22);}
  input.field:focus{
    border-color:rgba(255,200,0,0.4);
    background:rgba(255,200,0,0.03);
    box-shadow:0 0 0 4px rgba(255,200,0,0.06);
  }

  /* Add button */
  button.btn-add {
    width:100%;margin-top:4px;
    background:linear-gradient(135deg,var(--gold),#ffaa00);
    color:#06080f;border:none;border-radius:11px;
    padding:13px;font-family:'Syne',sans-serif;
    font-size:13px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-add:disabled{opacity:.55;cursor:not-allowed;}
  button.btn-add:not(:disabled):hover{
    transform:translateY(-2px);
    box-shadow:0 10px 32px rgba(255,200,0,0.3);
  }
  button.btn-add:not(:disabled):active{transform:translateY(0);}
  button.btn-add::after{
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);
    pointer-events:none;
  }
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:8px;}
  .spinner{
    width:14px;height:14px;border:2px solid rgba(6,8,15,0.25);
    border-top-color:#06080f;border-radius:50%;
    animation:spin .7s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Success toast */
  .toast {
    display:flex;align-items:center;gap:10px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.25);
    border-radius:10px;padding:11px 14px;
    font-size:13px;color:var(--accent);margin-bottom:12px;
  }

  /* Appointments list */
  .appt-list { display:flex;flex-direction:column;gap:10px;max-height:480px;overflow-y:auto;
    scrollbar-width:thin;scrollbar-color:var(--border) transparent;
  }
  .appt-list::-webkit-scrollbar{width:3px;}
  .appt-list::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}

  .appt-row {
    background:rgba(255,255,255,0.03);border:1px solid var(--border);
    border-radius:12px;padding:14px 16px;
    transition:border-color .2s;
  }
  .appt-row:hover{border-color:rgba(255,200,0,0.2);}
  .appt-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .appt-doc{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;}
  .slot-pill{
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.18);
    border-radius:6px;padding:3px 10px;font-size:11px;color:var(--accent);font-weight:600;
  }
  .appt-user{font-size:12px;color:var(--muted);}

  /* Skeleton */
  .skeleton {
    height:72px;border-radius:12px;
    background:linear-gradient(90deg,
      rgba(255,255,255,0.03) 0%,
      rgba(255,255,255,0.07) 50%,
      rgba(255,255,255,0.03) 100%);
    background-size:200% 100%;
    animation:shimmer 1.6s infinite;
  }
  @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

  /* Empty */
  .empty{text-align:center;padding:32px 16px;color:var(--muted);font-size:13px;}
`;

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
      <style>{css}</style>
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