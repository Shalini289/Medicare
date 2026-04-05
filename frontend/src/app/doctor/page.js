"use client";

import { useState } from "react";
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
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.14;
    animation:drift 17s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:580px;height:580px;background:var(--accent2);top:-180px;left:-120px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent);bottom:-140px;right:-100px;animation-delay:-7s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:#818cf8;top:42%;left:55%;animation-delay:-13s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,60px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* Page */
  .page {
    position:relative;z-index:1;
    max-width:1100px;margin:0 auto;
    padding:60px 24px 80px;
  }

  /* Header */
  .header { margin-bottom:48px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(0,180,255,0.08);border:1px solid rgba(0,180,255,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent2);font-weight:600;margin-bottom:20px;
  }
  .badge .dot {
    width:6px;height:6px;border-radius:50%;background:var(--accent2);
    animation:pulse-dot 2s infinite;
  }
  @keyframes pulse-dot{
    0%,100%{box-shadow:0 0 0 0 rgba(0,180,255,0.6);}
    50%{box-shadow:0 0 0 6px rgba(0,180,255,0);}
  }
  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(32px,5vw,50px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Filter card */
  .filter-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:24px 28px;margin-bottom:36px;
    backdrop-filter:blur(16px);position:relative;overflow:hidden;
  }
  .filter-card::before {
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);
    pointer-events:none;
  }
  .filter-row {
    display:grid;
    grid-template-columns:1fr 1fr 1fr 1fr auto;
    gap:12px;align-items:end;
  }
  @media(max-width:768px){ .filter-row{grid-template-columns:1fr 1fr;} }
  @media(max-width:480px){ .filter-row{grid-template-columns:1fr;} }

  .field-wrap { display:flex;flex-direction:column;gap:6px; }
  .field-label {
    font-size:10px;letter-spacing:.1em;text-transform:uppercase;
    color:var(--muted);font-weight:600;padding-left:2px;
  }
  .field-icon-wrap { position:relative; }
  .field-icon {
    position:absolute;left:13px;top:50%;transform:translateY(-50%);
    font-size:13px;pointer-events:none;
  }
  input.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:11px;
    padding:11px 13px 11px 38px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;
    outline:none;transition:border-color .25s,background .25s,box-shadow .25s;
    -webkit-appearance:none;
  }
  input.field::placeholder{color:rgba(255,255,255,0.22);}
  input.field::-webkit-calendar-picker-indicator{ filter:invert(0.6); cursor:pointer; }
  input.field:focus{
    border-color:rgba(0,180,255,0.5);
    background:rgba(0,180,255,0.04);
    box-shadow:0 0 0 4px rgba(0,180,255,0.07);
  }

  /* Search button */
  button.btn-search {
    background:var(--accent2);color:#fff;
    border:none;border-radius:11px;
    padding:11px 24px;
    font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;white-space:nowrap;height:44px;
    position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
    align-self:end;
  }
  button.btn-search:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,180,255,0.35);}
  button.btn-search:active{transform:translateY(0);}
  button.btn-search::after{
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent);
    pointer-events:none;
  }
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:8px;}
  .spinner{
    width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);
    border-top-color:#fff;border-radius:50%;
    animation:spin .7s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Results header */
  .results-header {
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:20px;
  }
  .results-label {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    display:flex;align-items:center;gap:10px;
  }
  .results-label .line{flex:1;height:1px;background:var(--border);}
  .results-count {
    font-size:12px;color:var(--muted);
    background:var(--glass);border:1px solid var(--border);
    border-radius:100px;padding:4px 12px;
  }

  /* Grid */
  .doc-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
    gap:16px;
  }

  /* Doctor card */
  .doc-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:18px;padding:22px;
    position:relative;overflow:hidden;
    transition:border-color .25s,transform .2s;
  }
  .doc-card::before{
    content:'';position:absolute;inset:0;border-radius:18px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 55%);
    pointer-events:none;
  }
  .doc-card:hover{border-color:rgba(0,180,255,0.25);transform:translateY(-3px);}

  .doc-head{display:flex;align-items:center;gap:14px;margin-bottom:16px;}
  .doc-avatar{
    width:48px;height:48px;border-radius:14px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(0,180,255,0.2),rgba(79,255,176,0.15));
    border:1px solid rgba(0,180,255,0.2);
    display:flex;align-items:center;justify-content:center;font-size:22px;
  }
  .doc-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:4px;}
  .doc-spec{
    font-size:11px;color:var(--accent2);font-weight:600;
    background:rgba(0,180,255,0.08);border:1px solid rgba(0,180,255,0.15);
    border-radius:6px;padding:2px 8px;display:inline-block;
  }

  .doc-meta{display:flex;gap:8px;flex-wrap:wrap;}
  .meta-chip{
    background:rgba(255,255,255,0.04);border:1px solid var(--border);
    border-radius:8px;padding:6px 12px;
    font-size:12px;color:var(--muted);
    display:flex;align-items:center;gap:5px;
  }
  .meta-chip.rating{
    background:rgba(255,200,0,0.07);border-color:rgba(255,200,0,0.18);
    color:#ffc800;font-family:'Syne',sans-serif;font-weight:700;
  }

  /* Empty state */
  .empty{
    grid-column:1/-1;
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:56px 32px;text-align:center;
  }
  .empty-icon{font-size:44px;margin-bottom:14px;}
  .empty-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:8px;}
  .empty-sub{color:var(--muted);font-size:13px;line-height:1.6;}

  /* Initial state (before search) */
  .initial{
    grid-column:1/-1;
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:56px 32px;text-align:center;
  }
  .initial-icon{font-size:44px;margin-bottom:14px;}
  .initial-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:8px;}
  .initial-sub{color:var(--muted);font-size:13px;line-height:1.6;}

  /* Skeleton shimmer */
  .skeleton{
    border-radius:18px;height:160px;
    background:linear-gradient(90deg,
      rgba(255,255,255,0.03) 0%,
      rgba(255,255,255,0.07) 50%,
      rgba(255,255,255,0.03) 100%);
    background-size:200% 100%;
    animation:shimmer 1.6s infinite;
  }
  @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
`;

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = {
  hidden:{ opacity:0, y:20 },
  show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } },
};
const cardAnim = {
  hidden:{ opacity:0, y:24, scale:0.97 },
  show:(i)=>({ opacity:1, y:0, scale:1, transition:{ delay:i*0.07, duration:0.45, ease:[0.22,1,0.36,1] } }),
};

export default function AvailableDoctorsPage() {
  const [filters, setFilters] = useState({
  date: "",
  time: "",
  location: "",
  specialization: "",
  name: ""   // ✅ ADD THIS
});
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const fetchDoctors = async () => {
  try {
    setLoading(true);
    setSearched(true);

    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );

    const query = new URLSearchParams(params).toString();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/available?${query}`
    );

    const data = await res.json();

    setDoctors(data.data || []);
  } catch (error) {
    console.error("Error fetching doctors:", error);
  } finally {
    setLoading(false);
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
            <span className="dot" /> Doctor Search
          </motion.div>
          <motion.h1 className="title" variants={fadeUp}>Find Available<br />Doctors</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>
            Filter by date, time, location and specialization.
          </motion.p>
        </motion.div>

        {/* Filter card */}
        <motion.div
          className="filter-card"
          initial={{ opacity:0, y:28, scale:0.97 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ delay:0.2, duration:0.5, ease:[0.22,1,0.36,1] }}
        >
          <div className="filter-row">

            <div className="field-wrap">
              <label className="field-label">Date</label>
              <div className="field-icon-wrap">
                <span className="field-icon">📅</span>
                <input className="field" type="date" name="date" onChange={handleChange} />
              </div>
            </div>

            <div className="field-wrap">
              <label className="field-label">Time</label>
              <div className="field-icon-wrap">
                <span className="field-icon">🕐</span>
                <input className="field" type="text" name="time" placeholder="e.g. 10:00 AM" onChange={handleChange} />
              </div>
            </div>

            <div className="field-wrap">
              <label className="field-label">Location</label>
              <div className="field-icon-wrap">
                <span className="field-icon">📍</span>
                <input className="field" type="text" name="location" placeholder="City or area" onChange={handleChange} />
              </div>
            </div>

            <div className="field-wrap">
              <label className="field-label">Specialization</label>
              <div className="field-icon-wrap">
                <span className="field-icon">🧠</span>
                <input className="field" type="text" name="specialization" placeholder="e.g. Cardiologist" onChange={handleChange} />
              </div>
            </div>
<br />
            <div className="field-wrap">
              <label className="field-label">Doctor</label>
              <div className="field-icon-wrap">
                <span className="field-icon">🧠</span>
               <input 
  className="field" 
  type="text" 
  name="name" 
  placeholder="Search doctor name"
  onChange={handleChange} 
/>
              </div>
            </div>

            <motion.button
              className="btn-search"
              onClick={fetchDoctors}
              whileTap={{ scale:0.96 }}
            >
              <span className="btn-inner">
                {loading ? <><div className="spinner"/>Searching…</> : <>🔍&nbsp;Search</>}
              </span>
            </motion.button>

          </div>
        </motion.div>

        {/* Results label */}
        {(searched || loading) && (
          <motion.div
            className="results-header"
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ duration:0.3 }}
          >
            <div className="results-label">
              <span>Results</span>
              <span className="line" />
            </div>
            {!loading && (
              <div className="results-count">
                {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} found
              </div>
            )}
          </motion.div>
        )}

        {/* Grid */}
        <motion.div className="doc-grid" variants={stagger} initial="hidden" animate="show">

          {/* Skeletons */}
          {loading && [1,2,3,4,5,6].map(i => (
            <motion.div key={i} className="skeleton"
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              transition={{ delay:i*0.06 }} />
          ))}

          {/* Initial state */}
          {!loading && !searched && (
            <motion.div className="initial" variants={fadeUp}>
              <div className="initial-icon">🔍</div>
              <div className="initial-title">Search for doctors</div>
              <div className="initial-sub">Use the filters above to find available doctors<br />matching your schedule and needs.</div>
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && searched && doctors.length === 0 && (
            <motion.div className="empty" variants={fadeUp}>
              <div className="empty-icon">😔</div>
              <div className="empty-title">No doctors found</div>
              <div className="empty-sub">Try adjusting your filters or broadening your search.</div>
            </motion.div>
          )}

          {/* Doctor cards */}
          <AnimatePresence>
            {!loading && doctors.map((doc, i) => (
              <motion.div
                key={doc._id}
                className="doc-card"
                custom={i}
                variants={cardAnim}
                initial="hidden"
                animate="show"
                exit={{ opacity:0, scale:0.95 }}
                whileHover={{ scale:1.02 }}
              >
                <div className="doc-head">
                  <div className="doc-avatar">👨‍⚕️</div>
                  <div>
                    <div className="doc-name">{doc.name}</div>
                    <span className="doc-spec">{doc.specialization}</span>
                  </div>
                </div>
                <div className="doc-meta">
                  <div className="meta-chip">🎓 {doc.experience} yrs exp</div>
                  <div className="meta-chip rating">★ {doc.rating}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

        </motion.div>
      </div>
    </>
  );
}