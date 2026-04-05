"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { predictAPI, getDoctorsAPI, bookAppointmentAPI } from "@/services/api";
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
    --danger:  #ff6b6b;
  }

  body { background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh; }

  .aurora { position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0; }
  .aurora span {
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.13;
    animation:drift 17s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:560px;height:560px;background:var(--accent);top:-180px;left:-100px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent2);bottom:-140px;right:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:300px;height:300px;background:#a78bfa;top:42%;left:52%;animation-delay:-13s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,60px) scale(1.1);}}

  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .page {
    position:relative;z-index:1;
    max-width:900px;margin:0 auto;padding:60px 24px 120px;
    display:flex;flex-direction:column;gap:32px;
  }

  /* Badge */
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent);font-weight:600;width:fit-content;margin-bottom:16px;
  }
  .badge .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse-dot 2s infinite;}
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(79,255,176,0.6);}50%{box-shadow:0 0 0 6px rgba(79,255,176,0);}}

  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(30px,5vw,52px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:8px;
  }
  .subtitle{color:var(--muted);font-size:14px;font-weight:300;}

  /* Section label */
  .section-lbl {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-bottom:16px;display:flex;align-items:center;gap:10px;
  }
  .section-lbl .line{flex:1;height:1px;background:var(--border);}

  /* Feature grid */
  .feature-grid {
    display:grid;
    grid-template-columns:repeat(6,1fr);
    gap:12px;
  }
  @media(max-width:640px){ .feature-grid{ grid-template-columns:repeat(3,1fr); } }
  @media(max-width:380px){ .feature-grid{ grid-template-columns:repeat(2,1fr); } }

  .feature-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:16px;padding:18px 12px;
    display:flex;flex-direction:column;align-items:center;gap:10px;
    cursor:pointer;position:relative;overflow:hidden;
    transition:border-color .25s,transform .2s;
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.03em;color:var(--muted);text-align:center;
  }
  .feature-card::before{
    content:'';position:absolute;inset:0;border-radius:16px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);
    pointer-events:none;
  }
  .feature-card:hover{
    border-color:rgba(79,255,176,0.28);color:var(--text);
    transform:translateY(-3px);
  }
  .feature-icon{
    width:42px;height:42px;border-radius:12px;
    background:linear-gradient(135deg,rgba(79,255,176,0.14),rgba(0,180,255,0.1));
    border:1px solid rgba(79,255,176,0.18);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }

  /* Glass card */
  .glass-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:28px;
    position:relative;overflow:hidden;
  }
  .glass-card::before{
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 55%);
    pointer-events:none;
  }
  .card-title{
    font-family:'Syne',sans-serif;font-size:16px;font-weight:700;
    margin-bottom:20px;display:flex;align-items:center;gap:10px;
  }
  .card-title-icon{
    width:32px;height:32px;border-radius:9px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(79,255,176,0.16),rgba(0,180,255,0.12));
    border:1px solid rgba(79,255,176,0.2);
    display:flex;align-items:center;justify-content:center;font-size:16px;
  }

  /* Inputs */
  input.field, textarea.field {
    width:100%;background:rgba(255,255,255,0.05);
    border:1px solid var(--border);border-radius:12px;
    padding:13px 16px;font-family:'DM Sans',sans-serif;font-size:14px;
    color:var(--text);outline:none;
    transition:border-color .2s,background .2s;
    display:block;
  }
  input.field::placeholder, textarea.field::placeholder{color:var(--muted);}
  input.field:focus, textarea.field:focus{
    border-color:rgba(79,255,176,0.35);background:rgba(79,255,176,0.04);
  }
  textarea.field{resize:vertical;min-height:100px;line-height:1.6;}
  .fields{display:flex;flex-direction:column;gap:12px;margin-bottom:20px;}

  /* Primary button */
  button.btn-primary {
    width:100%;
    background:var(--accent);color:#06080f;
    border:none;border-radius:12px;padding:14px;
    font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s,opacity .2s;
  }
  button.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(79,255,176,0.3);}
  button.btn-primary:active{transform:scale(0.98);}
  button.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
  button.btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);pointer-events:none;}

  /* Secondary actions row */
  .action-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;}
  button.btn-ghost {
    flex:1;min-width:fit-content;
    background:rgba(255,255,255,0.04);border:1px solid var(--border);
    border-radius:10px;padding:10px 16px;
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;
    color:var(--muted);cursor:pointer;
    transition:background .2s,border-color .2s,color .2s,transform .2s;
    display:flex;align-items:center;justify-content:center;gap:7px;
  }
  button.btn-ghost:hover{
    background:rgba(79,255,176,0.08);border-color:rgba(79,255,176,0.25);
    color:var(--accent);transform:translateY(-1px);
  }

  /* Spinner */
  .spinner{
    display:inline-block;width:14px;height:14px;
    border:2px solid rgba(6,8,15,0.25);border-top-color:#06080f;
    border-radius:50%;animation:spin .7s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg);}}
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:8px;}

  /* Doctors section */
  .doctors-grid{display:flex;flex-direction:column;gap:12px;}

  /* Sticky booking bar */
  .sticky-bar {
    position:fixed;bottom:0;left:0;right:0;z-index:100;
    padding:16px 24px;
    background:rgba(6,8,15,0.85);backdrop-filter:blur(20px);
    border-top:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;gap:16px;
  }
  .sticky-bar-info{flex:1;min-width:0;}
  .sticky-bar-label{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px;}
  .sticky-bar-val{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .sticky-bar-val span{color:var(--accent);}
  button.btn-book {
    background:var(--accent);color:#06080f;
    border:none;border-radius:12px;padding:13px 28px;
    font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;white-space:nowrap;flex-shrink:0;
    transition:transform .2s,box-shadow .2s,opacity .2s;
  }
  button.btn-book:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(79,255,176,0.32);}
  button.btn-book:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}

  /* Toast */
  .toast {
    position:fixed;bottom:88px;left:50%;transform:translateX(-50%);
    background:rgba(13,17,28,0.96);border:1px solid rgba(79,255,176,0.3);
    border-radius:12px;padding:12px 22px;
    display:flex;align-items:center;gap:10px;
    font-size:13px;color:var(--accent);font-weight:500;
    box-shadow:0 8px 32px rgba(0,0,0,0.5);
    white-space:nowrap;z-index:200;
  }
  .toast-icon{
    width:20px;height:20px;border-radius:50%;background:var(--accent);
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
  }
  .toast-icon svg{width:10px;height:10px;}
`;

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };
const cardAnim = { hidden:{ opacity:0, y:16, scale:0.98 }, show:(i)=>({ opacity:1, y:0, scale:1, transition:{ delay:i*0.06, duration:0.4, ease:[0.22,1,0.36,1] } }) };

const FEATURES = [
  { name:"Medicines", icon:"💊", path:"/medicines" },
  { name:"Reminders", icon:"🔔", path:"/reminders" },
  { name:"Family",    icon:"👨‍👩‍👧", path:"/family" },
  { name:"Chat",      icon:"💬", path:"/chat" },
  { name:"Hospitals", icon:"🏥", path:"/hospitals" },
  { name:"Records",   icon:"📄", path:"/medical/records" },
];

export default function Page() {
  const router = useRouter();

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
    if (!symptoms.trim()) return;
    try {
      setLoading(true);
      const res = await predictAPI({ text: symptoms });
      if (!res.data?.specialists?.length) { alert("No specialist found ❌"); return; }
      const topSpec = res.data.specialists[0].specialist;
      const formattedSpec = topSpec.replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase());
      setResult(res.data);
      const docRes = await getDoctorsAPI(formattedSpec);
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login first ❌");
    try {
      setBooking(true);
      await bookAppointmentAPI(
        { patientName, symptoms, doctorId:selectedDoctor._id, slot:selectedSlot, appointmentDate:new Date().toISOString() },
        token
      );
      setBooked(true);
      setSelectedDoctor(null);
      setSelectedSlot("");
      setTimeout(() => setBooked(false), 3000);
    } catch {
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
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> AI-Powered</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Doctor Assistant</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>Describe your symptoms — we'll find the right specialist.</motion.p>
        </motion.div>

        {/* Feature grid */}
        <div>
          <div className="section-lbl"><span>Quick Access</span><span className="line" /></div>
          <motion.div className="feature-grid" variants={stagger} initial="hidden" animate="show">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i} className="feature-card"
                custom={i} variants={cardAnim}
                onClick={() => router.push(f.path)}
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              >
                <div className="feature-icon">{f.icon}</div>
                <span>{f.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Patient form */}
        <motion.div
          className="glass-card"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, delay:0.3, ease:[0.22,1,0.36,1] }}
        >
          <div className="card-title">
            <div className="card-title-icon">🧾</div>
            Patient Details
          </div>
          <div className="fields">
            <input
              className="field"
              placeholder="Your name"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
            />
            <textarea
              className="field"
              placeholder="Describe your symptoms in detail…"
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
          </div>
          <motion.button
            className="btn-primary"
            onClick={handleCheck}
            disabled={loading || !symptoms.trim()}
            whileTap={{ scale:0.98 }}
          >
            <span className="btn-inner">
              {loading ? <><div className="spinner" /> Analyzing…</> : "Find Doctor →"}
            </span>
          </motion.button>
        </motion.div>

        {/* AI Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="glass-card"
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-10 }}
              transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
            >
              <div className="card-title">
                <div className="card-title-icon">🧠</div>
                AI Analysis
              </div>
              <ResultCard data={result} />
              <div className="action-row">
                {[
                  { label:"Medicines", icon:"💊", path:"/medicines" },
                  { label:"Reminder",  icon:"🔔", path:"/reminders" },
                  { label:"Chat",      icon:"💬", path:"/chat" },
                ].map(a => (
                  <motion.button key={a.path} className="btn-ghost" onClick={() => router.push(a.path)} whileTap={{ scale:0.97 }}>
                    <span>{a.icon}</span>{a.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doctors */}
        <AnimatePresence>
          {doctors.length > 0 && (
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.4 }}
            >
              <div className="section-lbl"><span>Available Doctors</span><span className="line" /></div>
              <motion.div className="doctors-grid" variants={stagger} initial="hidden" animate="show">
                {doctors.map((doc, i) => (
                  <motion.div key={doc._id} custom={i} variants={cardAnim}>
                    <DoctorCard
                      doc={doc}
                      isSelected={selectedDoctor?._id === doc._id}
                      selectedSlot={selectedSlot}
                      onSelect={(d, s) => { setSelectedDoctor(d); setSelectedSlot(s); }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Sticky booking bar */}
      <AnimatePresence>
        {selectedDoctor && selectedSlot && (
          <motion.div
            className="sticky-bar"
            initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }}
            exit={{ y:80, opacity:0 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
          >
            <div className="sticky-bar-info">
              <div className="sticky-bar-label">Selected appointment</div>
              <div className="sticky-bar-val">
                <span>{selectedDoctor.name}</span> · {selectedSlot}
              </div>
            </div>
            <motion.button
              className="btn-book"
              onClick={handleBooking}
              disabled={booking}
              whileTap={{ scale:0.97 }}
            >
              {booking ? "Booking…" : "Confirm Booking →"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {booked && (
          <motion.div
            className="toast"
            initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:24 }} transition={{ duration:0.3 }}
          >
            <div className="toast-icon">
              <svg viewBox="0 0 10 10" fill="none">
                <polyline points="2,5 4.2,7.2 8,2.5" stroke="#06080f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Appointment booked successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}