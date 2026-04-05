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
    --gold:    #ffc800;
    --danger:  #ff6b6b;
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
  .aurora span:nth-child(1){width:580px;height:580px;background:#ff6b6b;top:-200px;right:-100px;animation-delay:0s;opacity:0.08;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent2);bottom:-140px;left:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:var(--accent);top:42%;left:53%;animation-delay:-13s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,60px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .page { position:relative;z-index:1;max-width:600px;margin:0 auto;padding:60px 24px 80px; }

  /* Header */
  .header { margin-bottom:44px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.22);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--danger);font-weight:600;margin-bottom:20px;
  }
  .badge .dot { width:6px;height:6px;border-radius:50%;background:var(--danger);animation:pulse-dot 2s infinite; }
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(255,107,107,0.6);}50%{box-shadow:0 0 0 6px rgba(255,107,107,0);}}
  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(30px,5vw,48px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--danger) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Card */
  .card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:28px 32px;margin-bottom:20px;
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
    margin-bottom:20px;display:flex;align-items:center;gap:10px;
  }
  .card-title .line{flex:1;height:1px;background:var(--border);}

  /* Grid inputs */
  .grid2 { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px; }
  @media(max-width:460px){ .grid2{grid-template-columns:1fr;} }
  .field-wrap { display:flex;flex-direction:column;gap:6px; }
  .field-label { font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600; }
  .field-icon-wrap { position:relative; }
  .field-icon { position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none; }
  input.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:11px;
    padding:12px 13px 12px 38px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;
    outline:none;transition:border-color .25s,background .25s,box-shadow .25s;
  }
  input.field::placeholder{color:rgba(255,255,255,0.22);}
  input.field:focus{
    border-color:rgba(255,107,107,0.45);background:rgba(255,107,107,0.03);
    box-shadow:0 0 0 4px rgba(255,107,107,0.07);
  }

  /* Toggle switches */
  .toggles { display:flex;gap:12px;flex-wrap:wrap;margin-bottom:6px; }
  .toggle-wrap {
    flex:1;min-width:140px;
    display:flex;align-items:center;justify-content:space-between;
    background:rgba(255,255,255,0.03);border:1px solid var(--border);
    border-radius:12px;padding:13px 16px;cursor:pointer;
    transition:border-color .25s,background .25s;
    user-select:none;
  }
  .toggle-wrap.on {
    border-color:rgba(79,255,176,0.3);background:rgba(79,255,176,0.05);
  }
  .toggle-left { display:flex;align-items:center;gap:10px; }
  .toggle-emoji { font-size:18px; }
  .toggle-label { font-size:13px;font-weight:500; }
  input.toggle-input { display:none; }
  .toggle-pill {
    width:38px;height:22px;border-radius:100px;
    background:rgba(255,255,255,0.1);
    position:relative;transition:background .25s;flex-shrink:0;
  }
  .toggle-pill::after {
    content:'';position:absolute;width:16px;height:16px;
    border-radius:50%;background:#fff;top:3px;left:3px;
    transition:transform .25s,background .25s;
    box-shadow:0 1px 4px rgba(0,0,0,0.3);
  }
  .toggle-wrap.on .toggle-pill { background:var(--accent); }
  .toggle-wrap.on .toggle-pill::after { transform:translateX(16px); }

  /* Predict button */
  button.btn-predict {
    width:100%;margin-top:8px;
    background:linear-gradient(135deg,var(--danger),#ff4444);color:#fff;
    border:none;border-radius:12px;padding:15px;
    font-family:'Syne',sans-serif;font-size:14px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-predict:disabled{opacity:.55;cursor:not-allowed;}
  button.btn-predict:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(255,107,107,0.4);}
  button.btn-predict:not(:disabled):active{transform:translateY(0);}
  button.btn-predict::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent);pointer-events:none;}
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:10px;}
  .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Result cards */
  .results { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:0; }
  @media(max-width:460px){ .results{grid-template-columns:1fr;} }
  .risk-card {
    border-radius:18px;padding:24px 22px;
    position:relative;overflow:hidden;
  }
  .risk-card::before{
    content:'';position:absolute;inset:0;border-radius:18px;
    background:linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%);
    pointer-events:none;
  }
  .risk-card.diabetes {
    background:rgba(255,107,107,0.07);border:1px solid rgba(255,107,107,0.22);
  }
  .risk-card.heart {
    background:rgba(255,107,107,0.07);border:1px solid rgba(255,107,107,0.22);
  }
  .risk-label {
    font-size:11px;letter-spacing:.1em;text-transform:uppercase;
    color:var(--muted);margin-bottom:12px;
    display:flex;align-items:center;gap:8px;
  }
  .risk-icon { font-size:20px; }
  .risk-value {
    font-family:'Syne',sans-serif;font-size:32px;font-weight:800;
    line-height:1;margin-bottom:10px;
  }
  .risk-bar-track { height:5px;border-radius:3px;background:rgba(255,255,255,0.08);overflow:hidden; }
  .risk-bar-fill  { height:100%;border-radius:3px;transition:width .8s cubic-bezier(.22,1,.36,1); }

  /* risk level colours */
  .level-low    { color:var(--accent); }
  .level-medium { color:var(--gold); }
  .level-high   { color:var(--danger); }
  .fill-low     { background:linear-gradient(90deg,var(--accent),#00e68a); }
  .fill-medium  { background:linear-gradient(90deg,var(--gold),#ff9500); }
  .fill-high    { background:linear-gradient(90deg,var(--danger),#ff3333); }

  .risk-tag {
    display:inline-block;margin-top:10px;
    font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    border-radius:6px;padding:3px 9px;
  }
  .risk-tag.low    { background:rgba(79,255,176,0.1); border:1px solid rgba(79,255,176,0.25); color:var(--accent); }
  .risk-tag.medium { background:rgba(255,200,0,0.1);  border:1px solid rgba(255,200,0,0.25);  color:var(--gold); }
  .risk-tag.high   { background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.25);color:var(--danger); }
`;

// Parse risk level string to a 0–100 numeric value and tier
function parseRisk(val = "") {
  const s = String(val).toLowerCase().trim();
  if (s === "low"    || s === "low risk")    return { pct: 20, tier: "low" };
  if (s === "medium" || s === "moderate")    return { pct: 55, tier: "medium" };
  if (s === "high"   || s === "high risk")   return { pct: 88, tier: "high" };
  // numeric string like "0.72" or "72%"
  const n = parseFloat(s.replace("%", ""));
  if (!isNaN(n)) {
    const pct = n <= 1 ? Math.round(n * 100) : Math.round(n);
    return { pct, tier: pct < 35 ? "low" : pct < 65 ? "medium" : "high" };
  }
  return { pct: 0, tier: "low" };
}

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };

const FIELDS = [
  { name:"age",           label:"Age",            icon:"🎂", placeholder:"e.g. 35" },
  { name:"bmi",           label:"BMI",            icon:"⚖️", placeholder:"e.g. 24.5" },
  { name:"bloodSugar",    label:"Blood Sugar",    icon:"🩸", placeholder:"mg/dL" },
  { name:"cholesterol",   label:"Cholesterol",    icon:"💉", placeholder:"mg/dL" },
  { name:"bloodPressure", label:"Blood Pressure", icon:"🫀", placeholder:"e.g. 120/80" },
];

export default function PredictPage() {
  const [form,    setForm]    = useState({});
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const toggleCheck = (name) => {
    setForm(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const predict = async () => {
    try {
      setLoading(true);
      const res  = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const diabetes = result ? parseRisk(result.diabetesRisk) : null;
  const heart    = result ? parseRisk(result.heartRisk)    : null;

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div className="header" variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> AI Prediction</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Health Risk<br />Prediction</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>
            Enter your health metrics and our AI will assess your risk levels instantly.
          </motion.p>
        </motion.div>

        {/* Form card */}
        <motion.div className="card"
          initial={{ opacity:0, y:28, scale:0.97 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ delay:0.2, duration:0.5, ease:[0.22,1,0.36,1] }}>

          <div className="card-title"><span>Health Metrics</span><span className="line" /></div>

          {/* 2-col grid inputs */}
          <div className="grid2">
            {FIELDS.slice(0,4).map(({ name, label, icon, placeholder }, i) => (
              <motion.div className="field-wrap" key={name}
                initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:0.28 + i*0.06, duration:0.4 }}>
                <label className="field-label">{label}</label>
                <div className="field-icon-wrap">
                  <span className="field-icon">{icon}</span>
                  <input className="field" name={name} placeholder={placeholder} onChange={handleChange} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Full-width blood pressure */}
          <motion.div className="field-wrap" style={{ marginBottom:"20px" }}
            initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.52, duration:0.4 }}>
            <label className="field-label">Blood Pressure</label>
            <div className="field-icon-wrap">
              <span className="field-icon">🫀</span>
              <input className="field" name="bloodPressure" placeholder="e.g. 120/80" onChange={handleChange} />
            </div>
          </motion.div>

          {/* Lifestyle toggles */}
          <div className="card-title" style={{ marginBottom:"12px" }}><span>Lifestyle</span><span className="line" /></div>
          <div className="toggles" style={{ marginBottom:"20px" }}>
            {[
              { name:"smoking",  label:"Smoking",  emoji:"🚬" },
              { name:"exercise", label:"Exercise", emoji:"🏃" },
            ].map(({ name, label, emoji }) => (
              <div key={name}
                className={`toggle-wrap ${form[name] ? "on" : ""}`}
                onClick={() => toggleCheck(name)}>
                <div className="toggle-left">
                  <span className="toggle-emoji">{emoji}</span>
                  <span className="toggle-label">{label}</span>
                </div>
                <input type="checkbox" className="toggle-input" name={name}
                  checked={!!form[name]} onChange={handleChange} />
                <div className="toggle-pill" />
              </div>
            ))}
          </div>

          {/* Predict button */}
          <motion.button className="btn-predict"
            onClick={predict} disabled={loading}
            whileTap={{ scale:0.97 }}>
            <span className="btn-inner">
              {loading
                ? <><div className="spinner" /> Analysing…</>
                : <>🔬 &nbsp;Predict Risk</>
              }
            </span>
          </motion.button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity:0, y:28, scale:0.97 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-16 }}
              transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
            >
              <div className="card-title" style={{ marginBottom:"14px" }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--muted)" }}>
                  Risk Assessment
                </span>
                <span style={{ flex:1, height:"1px", background:"var(--border)" }} />
              </div>

              <div className="results">
                {/* Diabetes */}
                <motion.div className="risk-card diabetes"
                  initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:0.1, duration:0.45, ease:[0.22,1,0.36,1] }}>
                  <div className="risk-label">
                    <span className="risk-icon">🩸</span> Diabetes Risk
                  </div>
                  <div className={`risk-value level-${diabetes.tier}`}>
                    {String(result.diabetesRisk)}
                  </div>
                  <div className="risk-bar-track">
                    <motion.div className={`risk-bar-fill fill-${diabetes.tier}`}
                      initial={{ width:0 }}
                      animate={{ width:`${diabetes.pct}%` }}
                      transition={{ delay:0.3, duration:0.8, ease:[0.22,1,0.36,1] }} />
                  </div>
                  <span className={`risk-tag ${diabetes.tier}`}>{diabetes.tier}</span>
                </motion.div>

                {/* Heart */}
                <motion.div className="risk-card heart"
                  initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:0.18, duration:0.45, ease:[0.22,1,0.36,1] }}>
                  <div className="risk-label">
                    <span className="risk-icon">❤️</span> Heart Risk
                  </div>
                  <div className={`risk-value level-${heart.tier}`}>
                    {String(result.heartRisk)}
                  </div>
                  <div className="risk-bar-track">
                    <motion.div className={`risk-bar-fill fill-${heart.tier}`}
                      initial={{ width:0 }}
                      animate={{ width:`${heart.pct}%` }}
                      transition={{ delay:0.38, duration:0.8, ease:[0.22,1,0.36,1] }} />
                  </div>
                  <span className={`risk-tag ${heart.tier}`}>{heart.tier}</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}