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
    --text:    #e8ecf4;
    --muted:   rgba(232,236,244,0.45);
    --danger:  #ff6b6b;
    --warn:    #ffc800;
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
    max-width:860px;margin:0 auto;padding:60px 24px 80px;
  }

  /* Header */
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent);font-weight:600;margin-bottom:20px;
  }
  .badge .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse-dot 2s infinite;}
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(79,255,176,0.6);}50%{box-shadow:0 0 0 6px rgba(79,255,176,0);}}

  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(28px,5vw,46px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:8px;
  }
  .subtitle{color:var(--muted);font-size:14px;font-weight:300;margin-bottom:40px;}

  /* Streak card */
  .streak-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:24px 28px;
    display:flex;align-items:center;gap:20px;
    margin-bottom:32px;position:relative;overflow:hidden;
  }
  .streak-card::before{
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(79,255,176,0.06) 0%,transparent 55%);
    pointer-events:none;
  }
  .streak-flame{
    width:56px;height:56px;border-radius:16px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(255,200,0,0.18),rgba(255,107,107,0.12));
    border:1px solid rgba(255,200,0,0.2);
    display:flex;align-items:center;justify-content:center;font-size:26px;
  }
  .streak-info{flex:1;}
  .streak-label{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;}
  .streak-val{
    font-family:'Syne',sans-serif;font-size:36px;font-weight:800;
    background:linear-gradient(135deg,var(--warn),var(--danger));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    line-height:1;
  }
  .streak-days{font-size:12px;color:var(--muted);margin-top:2px;}

  /* Section label */
  .section-lbl {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-bottom:16px;display:flex;align-items:center;gap:10px;
  }
  .section-lbl .line{flex:1;height:1px;background:var(--border);}

  /* Log list */
  .log-list{display:flex;flex-direction:column;gap:12px;}

  /* Log card */
  .log-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:16px;padding:18px 20px;
    display:flex;align-items:center;gap:16px;
    position:relative;overflow:hidden;
    transition:border-color .25s,transform .2s;
  }
  .log-card::before{
    content:'';position:absolute;inset:0;border-radius:16px;
    background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 55%);
    pointer-events:none;
  }
  .log-card:hover{border-color:rgba(79,255,176,0.2);transform:translateX(3px);}
  .log-card.taken{border-color:rgba(79,255,176,0.15);}

  .log-icon{
    width:44px;height:44px;border-radius:12px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(79,255,176,0.15),rgba(0,180,255,0.1));
    border:1px solid rgba(79,255,176,0.18);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }
  .log-icon.pending{
    background:linear-gradient(135deg,rgba(255,200,0,0.12),rgba(255,107,107,0.08));
    border-color:rgba(255,200,0,0.2);
  }

  .log-info{flex:1;min-width:0;}
  .log-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:3px;}
  .log-date{font-size:12px;color:var(--muted);}

  /* Status badge */
  .status-taken{
    display:inline-flex;align-items:center;gap:6px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:6px 14px;
    font-size:12px;font-weight:600;color:var(--accent);
    white-space:nowrap;flex-shrink:0;
    font-family:'Syne',sans-serif;letter-spacing:.04em;
  }
  .status-taken .check{width:14px;height:14px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;}
  .status-taken .check svg{width:8px;height:8px;}

  /* Mark taken button */
  button.btn-mark {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.22);
    border-radius:100px;padding:8px 18px;
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.05em;
    color:var(--accent);cursor:pointer;white-space:nowrap;flex-shrink:0;
    transition:background .2s,border-color .2s,transform .2s,box-shadow .2s;
  }
  button.btn-mark:hover{
    background:rgba(79,255,176,0.16);border-color:var(--accent);
    transform:translateY(-1px);box-shadow:0 6px 20px rgba(79,255,176,0.18);
  }
  button.btn-mark:active{transform:scale(0.97);}

  /* Skeleton */
  .skeleton{
    height:80px;border-radius:16px;margin-bottom:12px;
    background:linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 100%);
    background-size:200% 100%;animation:shimmer 1.6s infinite;
  }
  @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

  /* Empty state */
  .empty{
    text-align:center;padding:60px 20px;
    background:var(--glass);border:1px solid var(--border);border-radius:20px;
  }
  .empty-icon{font-size:40px;margin-bottom:12px;}
  .empty-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:6px;}
  .empty-sub{font-size:13px;color:var(--muted);}

  /* Toast */
  .toast{
    position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
    background:rgba(13,17,28,0.95);border:1px solid rgba(79,255,176,0.3);
    border-radius:12px;padding:12px 20px;
    display:flex;align-items:center;gap:10px;
    font-size:13px;color:var(--accent);font-weight:500;
    box-shadow:0 8px 32px rgba(0,0,0,0.5);
    white-space:nowrap;z-index:1000;
  }
`;

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };
const slideIn = {
  hidden:{ opacity:0, x:-16, scale:0.98 },
  show:(i) => ({ opacity:1, x:0, scale:1, transition:{ delay:i*0.07, duration:0.4, ease:[0.22,1,0.36,1] } }),
  exit:{ opacity:0, x:16, scale:0.97, transition:{ duration:0.2 } },
};

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  } catch {
    return dateStr;
  }
}

export default function AdherencePage() {
  const [logs,    setLogs]    = useState([]);
  const [streak,  setStreak]  = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null); // medicineId being marked
  const [toast,   setToast]   = useState(false);

  const patientId = "123";

  const fetchData = async () => {
    try {
      const [logsRes, streakRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/adherence/${patientId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/adherence/streak/${patientId}`),
      ]);
      const logsData   = await logsRes.json();
      const streakData = await streakRes.json();
      setLogs(logsData.data || []);
      setStreak(streakData.streak || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const markTaken = async (log) => {
    setMarking(log._id);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/adherence/taken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, medicineName: log.medicineName }),
      });
      await fetchData();
      setToast(true);
      setTimeout(() => setToast(false), 2800);
    } catch (err) {
      console.error(err);
    } finally {
      setMarking(null);
    }
  };

  const takenCount   = logs.filter(l => l.status === "taken").length;
  const pendingCount = logs.filter(l => l.status !== "taken").length;

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> Adherence</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Medicine Tracker</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>
            Stay on top of your daily medications and build healthy habits.
          </motion.p>

          {/* Streak card */}
          <motion.div className="streak-card" variants={fadeUp}>
            <div className="streak-flame">🔥</div>
            <div className="streak-info">
              <div className="streak-label">Current streak</div>
              <div className="streak-val">{streak}</div>
              <div className="streak-days">day{streak !== 1 ? "s" : ""} in a row</div>
            </div>
            {!loading && (
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:"var(--accent)" }}>
                  {takenCount}
                  <span style={{ fontSize:"13px", color:"var(--muted)", fontWeight:400 }}> / {logs.length}</span>
                </div>
                <div style={{ fontSize:"11px", color:"var(--muted)", letterSpacing:".08em", textTransform:"uppercase" }}>taken today</div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Log list */}
        <div className="section-lbl">
          <span>Today's Doses</span><span className="line" />
          {!loading && pendingCount > 0 && (
            <span style={{ fontSize:"11px", color:"var(--warn)", fontWeight:600, whiteSpace:"nowrap" }}>
              {pendingCount} pending
            </span>
          )}
        </div>

        {loading && [1,2,3,4].map(i => (
          <motion.div key={i} className="skeleton" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.08 }} />
        ))}

        {!loading && logs.length === 0 && (
          <motion.div className="empty" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="empty-icon">💊</div>
            <div className="empty-title">No logs found</div>
            <div className="empty-sub">Your medicine schedule will appear here.</div>
          </motion.div>
        )}

        <motion.div className="log-list" variants={stagger} initial="hidden" animate="show">
          <AnimatePresence>
            {logs.map((log, i) => {
              const taken = log.status === "taken";
              return (
                <motion.div
                  key={log._id}
                  className={`log-card${taken ? " taken" : ""}`}
                  custom={i}
                  variants={slideIn}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  layout
                >
                  <div className={`log-icon${taken ? "" : " pending"}`}>
                    {taken ? "💊" : "⏳"}
                  </div>

                  <div className="log-info">
                    <div className="log-name">{log.medicineName}</div>
                    <div className="log-date">{formatDate(log.date)}</div>
                  </div>

                  {taken ? (
                    <div className="status-taken">
                      <span className="check">
                        <svg viewBox="0 0 8 8" fill="none">
                          <polyline points="1.5,4 3.2,5.8 6.5,2" stroke="#06080f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      Taken
                    </div>
                  ) : (
                    <motion.button
                      className="btn-mark"
                      onClick={() => markTaken(log)}
                      disabled={marking === log._id}
                      whileTap={{ scale:0.96 }}
                    >
                      {marking === log._id ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 12 12" style={{ animation:"spin .7s linear infinite" }}>
                            <circle cx="6" cy="6" r="5" stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeDasharray="20" strokeDashoffset="8"/>
                          </svg>
                          Marking…
                        </>
                      ) : "Mark as Taken →"}
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="toast"
            initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:24 }} transition={{ duration:0.3 }}>
            ✅ Marked as taken!
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </>
  );
}