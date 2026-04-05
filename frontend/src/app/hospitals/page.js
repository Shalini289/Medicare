"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #06080f;
    --glass:   rgba(255,255,255,0.04);
    --border:  rgba(255,255,255,0.08);
    --accent:  #4fffb0;
    --accent2: #00b4ff;
    --danger:  #ff6b6b;
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
  .aurora span:nth-child(1){width:580px;height:580px;background:var(--accent2);top:-180px;right:-100px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent);bottom:-140px;left:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:#818cf8;top:42%;left:53%;animation-delay:-13s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,60px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .page { position:relative;z-index:1;max-width:960px;margin:0 auto;padding:60px 24px 80px; }

  /* Header */
  .header { margin-bottom:44px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(0,180,255,0.08);border:1px solid rgba(0,180,255,0.22);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent2);font-weight:600;margin-bottom:20px;
  }
  .badge .dot { width:6px;height:6px;border-radius:50%;background:var(--accent2);animation:pulse-dot 2s infinite; }
  .live-dot  { width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse-dot 2s infinite; }
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(0,180,255,0.6);}50%{box-shadow:0 0 0 6px rgba(0,180,255,0);}}

  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(30px,5vw,50px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Live indicator bar */
  .live-bar {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.06);border:1px solid rgba(79,255,176,0.18);
    border-radius:100px;padding:5px 14px;font-size:11px;color:var(--accent);
    font-weight:600;letter-spacing:.06em;margin-bottom:36px;
  }

  /* Stats row */
  .stats { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:36px; }
  @media(max-width:600px){ .stats{grid-template-columns:1fr 1fr;} }
  .stat-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:16px;padding:16px 18px;position:relative;overflow:hidden;
  }
  .stat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);pointer-events:none;}
  .stat-val { font-family:'Syne',sans-serif;font-size:26px;font-weight:800;line-height:1;margin-bottom:5px; }
  .stat-lbl { font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted); }

  /* Section label */
  .section-lbl {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-bottom:16px;display:flex;align-items:center;gap:10px;
  }
  .section-lbl .line{flex:1;height:1px;background:var(--border);}

  /* Hospital grid */
  .hospital-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
    gap:16px;
  }

  /* Hospital card */
  .hosp-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:18px;padding:22px 24px;
    position:relative;overflow:hidden;
    transition:border-color .25s,transform .2s;
  }
  .hosp-card::before{
    content:'';position:absolute;inset:0;border-radius:18px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 55%);
    pointer-events:none;
  }
  .hosp-card:hover{ border-color:rgba(0,180,255,0.25);transform:translateY(-3px); }
  .hosp-card.updated{ border-color:rgba(79,255,176,0.5);animation:flash-border .6s ease; }
  @keyframes flash-border{
    0%  { box-shadow:0 0 0 0 rgba(79,255,176,0.5); }
    50% { box-shadow:0 0 20px 4px rgba(79,255,176,0.25); }
    100%{ box-shadow:0 0 0 0 rgba(79,255,176,0); }
  }

  /* Card head */
  .hosp-head { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;gap:10px; }
  .hosp-left { display:flex;align-items:center;gap:12px; }
  .hosp-icon {
    width:44px;height:44px;border-radius:12px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(0,180,255,0.2),rgba(79,255,176,0.15));
    border:1px solid rgba(0,180,255,0.2);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }
  .hosp-name { font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:4px; }
  .hosp-loc  { font-size:12px;color:var(--muted);display:flex;align-items:center;gap:4px; }

  /* Oxygen badge */
  .oxygen-badge {
    font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
    border-radius:8px;padding:5px 10px;flex-shrink:0;white-space:nowrap;
  }
  .oxygen-yes { background:rgba(79,255,176,0.1); border:1px solid rgba(79,255,176,0.25); color:var(--accent); }
  .oxygen-no  { background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.25);color:var(--danger); }

  /* Bed meters */
  .bed-meters { display:flex;flex-direction:column;gap:10px; }
  .bed-row { display:flex;flex-direction:column;gap:5px; }
  .bed-label-row { display:flex;justify-content:space-between;align-items:center; }
  .bed-label { font-size:11px;color:var(--muted);letter-spacing:.04em; }
  .bed-count {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  }
  .bed-track { height:5px;border-radius:3px;background:rgba(255,255,255,0.07);overflow:hidden; }
  .bed-fill  { height:100%;border-radius:3px;transition:width .7s cubic-bezier(.22,1,.36,1); }
  .fill-icu     { background:linear-gradient(90deg,var(--accent2),#0055cc); }
  .fill-general { background:linear-gradient(90deg,var(--accent),#00e68a); }

  /* Skeleton */
  .skeleton {
    height:180px;border-radius:18px;
    background:linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 100%);
    background-size:200% 100%;animation:shimmer 1.6s infinite;
  }
  @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

  /* Empty */
  .empty { grid-column:1/-1;text-align:center;padding:60px 20px; }
  .empty-icon { font-size:44px;margin-bottom:14px; }
  .empty-title { font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:8px; }
  .empty-sub { color:var(--muted);font-size:13px; }
`;

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };
const cardAnim = {
  hidden:{ opacity:0, y:24, scale:0.97 },
  show:(i)=>({ opacity:1, y:0, scale:1, transition:{ delay:i*0.07, duration:0.45, ease:[0.22,1,0.36,1] } }),
};

// Compute bed fill % capped at 100
function bedPct(count, max = 100) {
  return Math.min(100, Math.round((count / max) * 100));
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [connected, setConnected] = useState(false);
  const [updated,   setUpdated]   = useState(null); // id of last live-updated card

  useEffect(() => {
    fetchHospitals();

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("bedUpdate", (updatedHospital) => {
      setHospitals(prev =>
        prev.map(h => h._id === updatedHospital._id ? updatedHospital : h)
      );
      // flash the updated card
      setUpdated(updatedHospital._id);
      setTimeout(() => setUpdated(null), 800);
    });

    return () => socket.disconnect();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate stats
  const totalICU     = hospitals.reduce((s, h) => s + (h.beds?.icu     || 0), 0);
  const totalGeneral = hospitals.reduce((s, h) => s + (h.beds?.general || 0), 0);
  const withOxygen   = hospitals.filter(h => h.oxygenAvailable).length;

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div className="header" variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> Live Availability</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Hospital<br />Availability</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>Real-time bed and resource availability across all hospitals.</motion.p>
        </motion.div>

        {/* Live indicator */}
        <motion.div className="live-bar"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
          <span className="live-dot" style={{ background: connected ? "var(--accent)" : "var(--danger)",
            animation: connected ? "pulse-dot 2s infinite" : "none" }} />
          {connected ? "Live · Updates in real-time" : "Connecting…"}
        </motion.div>

        {/* Stats */}
        {!loading && hospitals.length > 0 && (
          <motion.div className="stats"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.25, duration:0.5 }}>
            <div className="stat-card">
              <div className="stat-val" style={{ color:"var(--accent2)" }}>{hospitals.length}</div>
              <div className="stat-lbl">Hospitals</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ color:"var(--danger)" }}>{totalICU}</div>
              <div className="stat-lbl">ICU Beds</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ color:"var(--accent)" }}>{totalGeneral}</div>
              <div className="stat-lbl">General Beds</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ color:"var(--gold)" }}>{withOxygen}</div>
              <div className="stat-lbl">Oxygen Available</div>
            </div>
          </motion.div>
        )}

        {/* Section label */}
        {!loading && (
          <motion.div className="section-lbl"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}>
            <span>All Hospitals</span><span className="line" />
          </motion.div>
        )}

        {/* Hospital grid */}
        <div className="hospital-grid">

          {/* Skeletons */}
          {loading && [1,2,3,4].map(i => (
            <motion.div key={i} className="skeleton"
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              transition={{ delay:i*0.08 }} />
          ))}

          {/* Empty */}
          {!loading && hospitals.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🏥</div>
              <div className="empty-title">No hospitals found</div>
              <div className="empty-sub">No hospital data is available at the moment.</div>
            </div>
          )}

          {/* Cards */}
          <AnimatePresence>
            {!loading && hospitals.map((h, i) => {
              const icuPct     = bedPct(h.beds?.icu,     50);
              const generalPct = bedPct(h.beds?.general, 200);

              return (
                <motion.div
                  key={h._id}
                  className={`hosp-card ${updated === h._id ? "updated" : ""}`}
                  custom={i}
                  variants={cardAnim}
                  initial="hidden"
                  animate="show"
                  whileHover={{ scale:1.02 }}
                >
                  {/* Head */}
                  <div className="hosp-head">
                    <div className="hosp-left">
                      <div className="hosp-icon">🏥</div>
                      <div>
                        <div className="hosp-name">{h.name}</div>
                        <div className="hosp-loc">📍 {h.location}</div>
                      </div>
                    </div>
                    <span className={`oxygen-badge ${h.oxygenAvailable ? "oxygen-yes" : "oxygen-no"}`}>
                      🫁 {h.oxygenAvailable ? "O₂ Available" : "No O₂"}
                    </span>
                  </div>

                  {/* Bed meters */}
                  <div className="bed-meters">
                    <div className="bed-row">
                      <div className="bed-label-row">
                        <span className="bed-label">ICU Beds</span>
                        <span className="bed-count" style={{ color:"var(--accent2)" }}>{h.beds?.icu ?? "—"}</span>
                      </div>
                      <div className="bed-track">
                        <motion.div className="bed-fill fill-icu"
                          initial={{ width:0 }}
                          animate={{ width:`${icuPct}%` }}
                          transition={{ delay:i*0.07+0.2, duration:0.7, ease:[0.22,1,0.36,1] }} />
                      </div>
                    </div>
                    <div className="bed-row">
                      <div className="bed-label-row">
                        <span className="bed-label">General Beds</span>
                        <span className="bed-count" style={{ color:"var(--accent)" }}>{h.beds?.general ?? "—"}</span>
                      </div>
                      <div className="bed-track">
                        <motion.div className="bed-fill fill-general"
                          initial={{ width:0 }}
                          animate={{ width:`${generalPct}%` }}
                          transition={{ delay:i*0.07+0.3, duration:0.7, ease:[0.22,1,0.36,1] }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}