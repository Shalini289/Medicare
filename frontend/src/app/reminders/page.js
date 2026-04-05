"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #06080f;
    --glass:   rgba(255,255,255,0.04);
    --border:  rgba(255,255,255,0.08);
    --accent:  #4fffb0;
    --accent2: #00b4ff;
    --gold:    #ffc800;
    --text:    #e8ecf4;
    --muted:   rgba(232,236,244,0.45);
  }

  body { background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh; }

  /* Aurora */
  .aurora { position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0; }
  .aurora span {
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.13;
    animation:drift 17s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:560px;height:560px;background:var(--gold);top:-180px;left:-100px;animation-delay:0s;opacity:0.09;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent);bottom:-140px;right:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:var(--accent2);top:42%;left:53%;animation-delay:-13s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,60px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .page { position:relative;z-index:1;max-width:720px;margin:0 auto;padding:60px 24px 80px; }

  /* Header */
  .header { margin-bottom:44px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.22);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--gold);font-weight:600;margin-bottom:20px;
  }
  .badge .dot { width:6px;height:6px;border-radius:50%;background:var(--gold);animation:pulse-dot 2s infinite; }
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(255,200,0,0.6);}50%{box-shadow:0 0 0 6px rgba(255,200,0,0);}}
  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(30px,5vw,48px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--gold) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Two-col layout */
  .layout { display:grid;grid-template-columns:1fr 1.4fr;gap:20px;align-items:start; }
  @media(max-width:640px){ .layout{grid-template-columns:1fr;} }

  /* Card */
  .card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:24px 26px;
    backdrop-filter:blur(16px);position:relative;overflow:hidden;
  }
  .card::before{
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);
    pointer-events:none;
  }
  .card-title {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-bottom:18px;display:flex;align-items:center;gap:10px;
  }
  .card-title .line{flex:1;height:1px;background:var(--border);}

  /* Inputs */
  .field-wrap { display:flex;flex-direction:column;gap:6px;margin-bottom:12px; }
  .field-label { font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600; }
  .field-icon-wrap { position:relative; }
  .field-icon { position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none; }
  input.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:11px;
    padding:11px 13px 11px 38px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;
    outline:none;transition:border-color .25s,background .25s,box-shadow .25s;
    -webkit-appearance:none;
  }
  input.field::placeholder{color:rgba(255,255,255,0.22);}
  input[type="time"].field::-webkit-calendar-picker-indicator{ filter:invert(0.5);cursor:pointer; }
  input.field:focus{
    border-color:rgba(255,200,0,0.45);background:rgba(255,200,0,0.03);
    box-shadow:0 0 0 4px rgba(255,200,0,0.07);
  }

  /* Add button */
  button.btn-add {
    width:100%;margin-top:4px;
    background:linear-gradient(135deg,var(--gold),#ffaa00);color:#06080f;
    border:none;border-radius:11px;padding:13px;
    font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-add:disabled{opacity:.55;cursor:not-allowed;}
  button.btn-add:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(255,200,0,0.3);}
  button.btn-add:not(:disabled):active{transform:translateY(0);}
  button.btn-add::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);pointer-events:none;}
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:8px;}
  .spinner{width:14px;height:14px;border:2px solid rgba(6,8,15,0.25);border-top-color:#06080f;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Success toast */
  .toast {
    display:flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.25);
    border-radius:10px;padding:10px 14px;margin-bottom:14px;
    font-size:13px;color:var(--accent);
  }

  /* Section label */
  .section-lbl {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-bottom:14px;display:flex;align-items:center;gap:10px;
  }
  .section-lbl .count {
    background:rgba(255,200,0,0.1);border:1px solid rgba(255,200,0,0.2);
    border-radius:100px;padding:2px 10px;font-size:11px;color:var(--gold);
  }
  .section-lbl .line{flex:1;height:1px;background:var(--border);}

  /* Reminder rows */
  .rem-list { display:flex;flex-direction:column;gap:10px; }
  .rem-row {
    background:rgba(255,255,255,0.03);border:1px solid var(--border);
    border-radius:14px;padding:14px 18px;
    display:flex;align-items:center;gap:14px;
    position:relative;overflow:hidden;
    transition:border-color .25s,transform .2s;
  }
  .rem-row::before{
    content:'';position:absolute;inset:0;border-radius:14px;
    background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 60%);
    pointer-events:none;
  }
  .rem-row:hover{ border-color:rgba(255,200,0,0.2);transform:translateY(-1px); }

  .rem-time-block {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.18);
    border-radius:10px;padding:8px 12px;min-width:62px;flex-shrink:0;
  }
  .rem-time {
    font-family:'Syne',sans-serif;font-size:15px;font-weight:800;
    color:var(--gold);line-height:1;
  }
  .rem-time-label { font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:3px; }

  .rem-icon {
    width:36px;height:36px;border-radius:10px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(79,255,176,0.15),rgba(0,180,255,0.12));
    border:1px solid rgba(79,255,176,0.18);
    display:flex;align-items:center;justify-content:center;font-size:16px;
  }
  .rem-body { flex:1;min-width:0; }
  .rem-medicine { font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
  .rem-patient  { font-size:11px;color:var(--muted); }

  /* Empty state */
  .empty { text-align:center;padding:40px 20px; }
  .empty-icon { font-size:40px;margin-bottom:12px; }
  .empty-title { font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:6px; }
  .empty-sub { color:var(--muted);font-size:13px;line-height:1.6; }

  /* Skeleton */
  .skeleton { height:72px;border-radius:14px;margin-bottom:10px;
    background:linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 100%);
    background-size:200% 100%;animation:shimmer 1.6s infinite;
  }
  @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
`;

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };
const rowAnim = {
  hidden:{ opacity:0, x:-16, scale:0.97 },
  show:(i)=>({ opacity:1, x:0, scale:1, transition:{ delay:i*0.07, duration:0.4, ease:[0.22,1,0.36,1] } }),
  exit:{ opacity:0, x:20, scale:0.95, transition:{ duration:0.25 } },
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm]           = useState({ patientId:"", medicineName:"", time:"" });
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [toast, setToast]         = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fetchReminders = async () => {
    try {
      setFetching(true);
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reminders`);
      const data = await res.json();
      setReminders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  const createReminder = async () => {
    if (!form.patientId || !form.medicineName || !form.time) {
      return alert("All fields required");
    }
    try {
      setLoading(true);
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      console.log(data);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      setForm({ patientId:"", medicineName:"", time:"" });
      fetchReminders();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format time string for display
  const formatTime = (t = "") => {
    if (!t) return t;
    const [h, m] = t.split(":").map(Number);
    if (isNaN(h)) return t;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div className="header" variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> Medicine Reminders</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Reminders</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>Schedule and manage medication reminders for patients.</motion.p>
        </motion.div>

        <div className="layout">

          {/* ── Form ── */}
          <motion.div className="card"
            initial={{ opacity:0, y:28, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ delay:0.2, duration:0.5, ease:[0.22,1,0.36,1] }}>

            <div className="card-title"><span>New Reminder</span><span className="line" /></div>

            <AnimatePresence>
              {toast && (
                <motion.div className="toast"
                  initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }} transition={{ duration:0.25 }}>
                  ✅ Reminder created!
                </motion.div>
              )}
            </AnimatePresence>

            {[
              { name:"patientId",   label:"Patient ID",    icon:"👤", placeholder:"e.g. PAT-001", type:"text" },
              { name:"medicineName",label:"Medicine Name", icon:"💊", placeholder:"e.g. Metformin", type:"text" },
              { name:"time",        label:"Time",          icon:"⏰", placeholder:"",              type:"time" },
            ].map(({ name, label, icon, placeholder, type }, i) => (
              <motion.div className="field-wrap" key={name}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:0.3 + i*0.07, duration:0.4 }}>
                <label className="field-label">{label}</label>
                <div className="field-icon-wrap">
                  <span className="field-icon">{icon}</span>
                  <input
                    className="field" type={type} name={name}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            ))}

            <motion.button className="btn-add"
              onClick={createReminder} disabled={loading}
              whileTap={{ scale:0.97 }}
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              transition={{ delay:0.55 }}>
              <span className="btn-inner">
                {loading ? <><div className="spinner" />Saving…</> : <>🔔 &nbsp;Add Reminder</>}
              </span>
            </motion.button>
          </motion.div>

          {/* ── List ── */}
          <motion.div
            initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.3, duration:0.5, ease:[0.22,1,0.36,1] }}>

            <div className="section-lbl">
              <span>Active Reminders</span>
              {!fetching && <span className="count">{reminders.length}</span>}
              <span className="line" />
            </div>

            {/* Skeletons */}
            {fetching && [1,2,3].map(i => (
              <motion.div key={i} className="skeleton"
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay:i*0.08 }} />
            ))}

            {/* Empty */}
            {!fetching && reminders.length === 0 && (
              <motion.div className="empty"
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay:0.2 }}>
                <div className="empty-icon">🔕</div>
                <div className="empty-title">No reminders yet</div>
                <div className="empty-sub">Add a reminder using the form<br />to get started.</div>
              </motion.div>
            )}

            {/* Reminder rows */}
            <div className="rem-list">
              <AnimatePresence>
                {!fetching && reminders.map((rem, i) => (
                  <motion.div key={rem._id} className="rem-row"
                    custom={i} variants={rowAnim}
                    initial="hidden" animate="show" exit="exit" layout>
                    <div className="rem-time-block">
                      <div className="rem-time">{formatTime(rem.time)}</div>
                      <div className="rem-time-label">Daily</div>
                    </div>
                    <div className="rem-icon">💊</div>
                    <div className="rem-body">
                      <div className="rem-medicine">{rem.medicineName}</div>
                      <div className="rem-patient">👤 {rem.patientId}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
}