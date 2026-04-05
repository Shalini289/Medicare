"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
    --purple:  #a78bfa;
    --text:    #e8ecf4;
    --muted:   rgba(232,236,244,0.45);
  }

  body { background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh; }

  .aurora { position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0; }
  .aurora span {
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.13;
    animation:drift 18s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:560px;height:560px;background:var(--purple);top:-180px;right:-100px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent2);bottom:-140px;left:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:var(--accent);top:45%;left:52%;animation-delay:-14s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,65px) scale(1.1);}}

  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .page { position:relative;z-index:1;max-width:760px;margin:0 auto;padding:60px 24px 80px; }

  .header { margin-bottom:48px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.22);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--purple);font-weight:600;margin-bottom:20px;
  }
  .badge .dot { width:6px;height:6px;border-radius:50%;background:var(--purple);animation:pulse-dot 2s infinite; }
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0.6);}50%{box-shadow:0 0 0 6px rgba(167,139,250,0);}}

  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(32px,5vw,50px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--purple) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  .stats { display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:36px; }
  @media(max-width:500px){ .stats{grid-template-columns:1fr 1fr;} }
  .stat-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:16px;padding:18px 20px;position:relative;overflow:hidden;
  }
  .stat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);pointer-events:none;}
  .stat-val { font-family:'Syne',sans-serif;font-size:28px;font-weight:800;line-height:1;margin-bottom:5px; }
  .stat-lbl { font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted); }

  .section-lbl {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-bottom:16px;display:flex;align-items:center;gap:10px;
  }
  .section-lbl .line{flex:1;height:1px;background:var(--border);}

  .rec-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:18px;padding:22px 24px;margin-bottom:14px;
    position:relative;overflow:hidden;
    transition:border-color .25s,transform .2s;
  }
  .rec-card::before{content:'';position:absolute;inset:0;border-radius:18px;background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 55%);pointer-events:none;}
  .rec-card:hover{ border-color:rgba(167,139,250,0.25);transform:translateY(-2px); }

  .rec-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:12px; }
  .rec-left { display:flex;align-items:center;gap:14px; }
  .rec-icon {
    width:46px;height:46px;border-radius:13px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(167,139,250,0.2),rgba(0,180,255,0.15));
    border:1px solid rgba(167,139,250,0.2);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }
  .rec-type { font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:4px; }
  .rec-doctor { font-size:12px;color:var(--muted);display:flex;align-items:center;gap:5px; }

  .type-badge { font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-radius:6px;padding:4px 10px;flex-shrink:0; }
  .type-badge.lab     { background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);color:var(--accent); }
  .type-badge.imaging { background:rgba(0,180,255,0.08);border:1px solid rgba(0,180,255,0.2);color:var(--accent2); }
  .type-badge.report  { background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);color:var(--purple); }
  .type-badge.default { background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--muted); }

  a.view-btn {
    display:inline-flex;align-items:center;gap:7px;
    background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);
    border-radius:9px;padding:9px 16px;
    font-size:12px;font-weight:600;font-family:'Syne',sans-serif;
    color:var(--purple);text-decoration:none;letter-spacing:.04em;
    transition:all .2s;
  }
  a.view-btn:hover{
    background:rgba(167,139,250,0.15);border-color:rgba(167,139,250,0.4);
    transform:translateY(-1px);box-shadow:0 6px 20px rgba(167,139,250,0.2);
  }
  .view-arrow { font-size:14px;display:inline-block;transition:transform .2s; }
  a.view-btn:hover .view-arrow{ transform:translateX(3px); }

  .empty { background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:64px 32px;text-align:center; }
  .empty-icon { font-size:46px;margin-bottom:16px; }
  .empty-title { font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:8px; }
  .empty-sub { color:var(--muted);font-size:14px;line-height:1.6; }

  .skeleton {
    height:110px;border-radius:18px;margin-bottom:14px;
    background:linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 100%);
    background-size:200% 100%;animation:shimmer 1.6s infinite;
  }
  @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
`;

function getTypeMeta(type = "") {
  const t = type.toLowerCase();
  if (t.includes("lab") || t.includes("blood")) return { cls:"lab",     icon:"🧪" };
  if (t.includes("xray") || t.includes("mri") || t.includes("scan") || t.includes("imaging")) return { cls:"imaging", icon:"🩻" };
  if (t.includes("report") || t.includes("discharge") || t.includes("summary")) return { cls:"report",  icon:"📋" };
  return { cls:"default", icon:"📄" };
}

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };
const cardAnim = {
  hidden:{ opacity:0, y:22, scale:0.97 },
  show:(i)=>({ opacity:1, y:0, scale:1, transition:{ delay:i*0.07, duration:0.45, ease:[0.22,1,0.36,1] } }),
  exit:{ opacity:0, x:-20, scale:0.96, transition:{ duration:0.25 } },
};

export default function MedicalRecords() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`http://localhost:5000/api/medical/${patientId}`);
      const data = await res.json();
      setRecords(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueTypes   = [...new Set(records.map(r => r.reportType).filter(Boolean))];
  const uniqueDoctors = [...new Set(records.map(r => r.doctorId?.name).filter(Boolean))];

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div className="header" variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> Patient Records</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Medical<br />Records</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>
            All reports and documents for patient&nbsp;
            <strong style={{ color:"var(--text)", opacity:0.7 }}>{patientId}</strong>
          </motion.p>
        </motion.div>

        {/* Stats */}
        {!loading && records.length > 0 && (
          <motion.div className="stats"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.25, duration:0.5 }}>
            <div className="stat-card">
              <div className="stat-val" style={{ color:"var(--purple)" }}>{records.length}</div>
              <div className="stat-lbl">Total Records</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ color:"var(--accent2)" }}>{uniqueTypes.length}</div>
              <div className="stat-lbl">Report Types</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ color:"var(--accent)" }}>{uniqueDoctors.length}</div>
              <div className="stat-lbl">Doctors</div>
            </div>
          </motion.div>
        )}

        {/* Section label */}
        {!loading && records.length > 0 && (
          <motion.div className="section-lbl"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}>
            <span>All Documents</span><span className="line" />
          </motion.div>
        )}

        {/* Skeletons */}
        {loading && [1,2,3].map(i => (
          <motion.div key={i} className="skeleton"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.08 }} />
        ))}

        {/* Empty */}
        {!loading && records.length === 0 && (
          <motion.div className="empty"
            initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
            transition={{ duration:0.5, delay:0.2 }}>
            <div className="empty-icon">🗂️</div>
            <div className="empty-title">No records found</div>
            <div className="empty-sub">No medical records are on file<br />for this patient yet.</div>
          </motion.div>
        )}

        {/* Records */}
        <AnimatePresence>
          {!loading && records.map((rec, i) => {
            const { cls, icon } = getTypeMeta(rec.reportType);
            return (
              <motion.div key={rec._id} className="rec-card"
                custom={i} variants={cardAnim} initial="hidden" animate="show" exit="exit" layout>
                <div className="rec-top">
                  <div className="rec-left">
                    <div className="rec-icon">{icon}</div>
                    <div>
                      <div className="rec-type">{rec.reportType || "Medical Report"}</div>
                      <div className="rec-doctor">👨‍⚕️ {rec.doctorId?.name || "Unknown Doctor"}</div>
                    </div>
                  </div>
                  <span className={`type-badge ${cls}`}>{cls}</span>
                </div>

                <a className="view-btn"
                  href={`http://localhost:5000/${rec.reportUrl}`}
                  target="_blank" rel="noopener noreferrer">
                  View Report <span className="view-arrow">→</span>
                </a>
              </motion.div>
            );
          })}
        </AnimatePresence>

      </div>
    </>
  );
}