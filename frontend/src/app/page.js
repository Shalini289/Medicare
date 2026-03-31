"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  predictAPI,
  getDoctorsAPI,
  bookAppointmentAPI
} from "@/services/api";
import DoctorCard from "@/components/DoctorCard";
import ResultCard from "@/components/ResultCard";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #06080f;
    --glass:   rgba(255,255,255,0.04);
    --border:  rgba(255,255,255,0.08);
    --accent:  #4fffb0;
    --accent2: #00b4ff;
    --text:    #e8ecf4;
    --muted:   rgba(232,236,244,0.45);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .aurora { position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0; }
  .aurora span {
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.15;
    animation:drift 16s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:600px;height:600px;background:var(--accent);top:-200px;left:-150px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent2);bottom:-150px;right:-100px;animation-delay:-6s;}
  .aurora span:nth-child(3){width:350px;height:350px;background:#a855f7;top:40%;left:60%;animation-delay:-11s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(40px,60px) scale(1.12);}}

  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .page {
    position:relative;z-index:1;
    max-width:680px;margin:0 auto;
    padding:60px 20px 120px;
  }

  .header { text-align:center; margin-bottom:52px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent);font-weight:600;margin-bottom:22px;
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
    font-size:clamp(36px,6vw,58px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:12px;
  }
  .subtitle { color:var(--muted);font-size:15px;line-height:1.6;font-weight:300; }

  .card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:28px;margin-bottom:20px;
    backdrop-filter:blur(16px);position:relative;overflow:hidden;
  }
  .card::before{
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 60%);
    pointer-events:none;
  }
  .card-title {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;
    color:var(--muted);margin-bottom:20px;
    display:flex;align-items:center;gap:10px;
  }
  .card-title .line{flex:1;height:1px;background:var(--border);}

  .input-wrap{position:relative;margin-bottom:12px;}
  .input-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none;}
  input.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:12px;
    padding:14px 16px 14px 44px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;
    outline:none;transition:border-color .25s,background .25s,box-shadow .25s;
  }
  input.field::placeholder{color:rgba(255,255,255,0.25);}
  input.field:focus{border-color:rgba(79,255,176,0.5);background:rgba(79,255,176,0.04);box-shadow:0 0 0 4px rgba(79,255,176,0.07);}

  .textarea-wrap{position:relative;margin-bottom:12px;}
  .textarea-icon{position:absolute;left:16px;top:16px;font-size:15px;pointer-events:none;}
  textarea.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:12px;
    padding:14px 16px 14px 44px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;
    outline:none;resize:vertical;min-height:90px;line-height:1.6;
    transition:border-color .25s,background .25s,box-shadow .25s;
  }
  textarea.field::placeholder{color:rgba(255,255,255,0.25);}
  textarea.field:focus{border-color:rgba(79,255,176,0.5);background:rgba(79,255,176,0.04);box-shadow:0 0 0 4px rgba(79,255,176,0.07);}

  button.btn-primary {
    width:100%;margin-top:6px;
    background:var(--accent);color:#06080f;
    border:none;border-radius:12px;
    padding:15px;font-family:'Syne',sans-serif;
    font-size:14px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-primary:disabled{opacity:.55;cursor:not-allowed;}
  button.btn-primary:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(79,255,176,0.35);}
  button.btn-primary:not(:disabled):active{transform:translateY(0);}
  button.btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.22),transparent);pointer-events:none;}
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:10px;}
  .spinner{width:16px;height:16px;border:2px solid rgba(6,8,15,0.25);border-top-color:#06080f;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}

  .specialists{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;}
  .spec-pill{
    display:flex;align-items:center;gap:6px;
    background:rgba(79,255,176,0.07);border:1px solid rgba(79,255,176,0.18);
    border-radius:100px;padding:6px 14px;font-size:12px;color:var(--accent);font-weight:600;
  }
  .spec-pill .conf{background:rgba(79,255,176,0.12);border-radius:100px;padding:2px 7px;font-size:10px;}

  .section-label{
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-bottom:14px;display:flex;align-items:center;gap:10px;
  }
  .section-label .line{flex:1;height:1px;background:var(--border);}

  .sticky-bar {
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    width:calc(100% - 40px);max-width:640px;
    background:rgba(13,17,28,0.92);border:1px solid rgba(79,255,176,0.25);
    border-radius:16px;backdrop-filter:blur(20px);
    padding:14px 20px;
    display:flex;align-items:center;justify-content:space-between;
    box-shadow:0 8px 48px rgba(0,0,0,0.6),0 0 0 1px rgba(79,255,176,0.06);
    z-index:100;gap:16px;
  }
  .sticky-info .doc-n{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;}
  .sticky-info .slot-s{color:var(--accent);font-size:12px;margin-top:2px;}
  button.btn-confirm {
    background:var(--accent);color:#06080f;border:none;border-radius:10px;
    padding:11px 22px;font-family:'Syne',sans-serif;
    font-size:13px;font-weight:700;letter-spacing:.04em;
    cursor:pointer;white-space:nowrap;flex-shrink:0;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-confirm:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(79,255,176,0.4);}
  button.btn-confirm:disabled{opacity:.6;cursor:not-allowed;}
`;

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Page() {
  const [patientName,    setPatientName]    = useState("");
  const [symptoms,       setSymptoms]       = useState("");
  const [result,         setResult]         = useState(null);
  const [doctors,        setDoctors]        = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot,   setSelectedSlot]   = useState("");
  const [loading,        setLoading]        = useState(false);
  const [booking,        setBooking]        = useState(false);
  const [booked,         setBooked]         = useState(false);

  const handleCheck = async () => {
  try {
    setLoading(true);

    const res = await predictAPI({ text: symptoms });

    console.log("API RESPONSE 👉", res.data);

    // ✅ SAFETY CHECK
    if (!res.data?.specialists || res.data.specialists.length === 0) {
      alert("No specialist found ❌");
      return;
    }

    const topSpec = res.data.specialists[0].specialist;

    setResult(res.data);

const formattedSpec = topSpec
  .replace(/_/g, " ")
  .replace(/\b\w/g, l => l.toUpperCase());

console.log("FORMATTED 👉", formattedSpec);

const docRes = await getDoctorsAPI(formattedSpec);
    setDoctors(docRes.data);

  } catch (err) {
    console.log(err);
    alert("Error ❌");
  } finally {
    setLoading(false);
  }
};

  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Login first ❌"); return; }
    try {
      setBooking(true);
      await bookAppointmentAPI(
        { patientName, symptoms, doctorId: selectedDoctor._id, slot: selectedSlot, appointmentDate: new Date().toISOString() },
        token
      );
      setBooked(true);
      setSelectedDoctor(null); setSelectedSlot("");
      setTimeout(() => setBooked(false), 3500);
    } catch (err) {
      alert("Booking failed ❌");
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div className="header" variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}>
            <span className="dot" /> AI-Powered
          </motion.div>
          <motion.h1 className="title" variants={fadeUp}>Doctor<br />Assistant</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>
            Describe your symptoms — our AI will match<br />you with the right specialist instantly.
          </motion.p>
        </motion.div>

        {/* Success toast */}
        <AnimatePresence>
          {booked && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "rgba(79,255,176,0.08)", border: "1px solid rgba(79,255,176,0.25)",
                borderRadius: "12px", padding: "13px 18px", marginBottom: "16px",
                fontSize: "13px", color: "var(--accent)", display: "flex", alignItems: "center", gap: "10px"
              }}
            >
              ✅ Appointment confirmed! Check your dashboard.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="card-title"><span>Patient Details</span><span className="line" /></div>

          <motion.div className="input-wrap"
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}>
            <span className="input-icon">👤</span>
            <input className="field" placeholder="Full name"
              value={patientName} onChange={e => setPatientName(e.target.value)} />
          </motion.div>

          <motion.div className="textarea-wrap"
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}>
            <span className="textarea-icon">🩺</span>
            <textarea className="field" placeholder="Describe your symptoms in detail…"
              value={symptoms} onChange={e => setSymptoms(e.target.value)} />
          </motion.div>

          <motion.button
            className="btn-primary"
            onClick={handleCheck}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.46 }}
          >
            <span className="btn-inner">
              {loading
                ? <><div className="spinner" /> Analysing symptoms…</>
                : <>🧠 &nbsp;Find My Doctor</>
              }
            </span>
          </motion.button>
        </motion.div>

        <AnimatePresence mode="popLayout">

          {/* AI Result */}
          {result && (
            <motion.div
              key="result"
              className="card"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="card-title"><span>AI Analysis</span><span className="line" /></div>
              <ResultCard data={result} />

              {result.specialists?.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>
                    Recommended Specialists
                  </div>
                  <div className="specialists">
                    {result.specialists.map((s, i) => (
                      <motion.span key={i} className="spec-pill"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}>
                        🏥 {s.specialist}
                        {s.confidence && <span className="conf">{Math.round(s.confidence * 100)}%</span>}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Doctors */}
          {doctors.length > 0 && (
            <motion.div key="doctors"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <div className="section-label">
                <span>Available Doctors</span><span className="line" />
              </div>
              {doctors.map((doc, i) => (
                <motion.div key={doc._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                  <DoctorCard
                    doc={doc}
                    isSelected={selectedDoctor?._id === doc._id}
                    selectedSlot={selectedSlot}
                    onSelect={(d, s) => { setSelectedDoctor(d); setSelectedSlot(s); }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Sticky bar */}
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
              <div className="doc-n">{selectedDoctor.name}</div>
              <div className="slot-s">📅 {selectedSlot}</div>
            </div>
            <motion.button
              className="btn-confirm"
              onClick={handleBooking}
              disabled={booking}
              whileTap={{ scale: 0.95 }}
            >
              {booking
                ? <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "13px", height: "13px", border: "2px solid rgba(6,8,15,0.25)", borderTopColor: "#06080f", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                    Booking…
                  </span>
                : "Confirm Booking →"
              }
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    
    </>
  );
}