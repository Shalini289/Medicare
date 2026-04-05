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
    --purple:  #a78bfa;
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
  .aurora span:nth-child(1){width:560px;height:560px;background:var(--purple);top:-180px;left:-100px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent2);bottom:-140px;right:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:var(--accent);top:42%;left:53%;animation-delay:-13s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,60px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .page { position:relative;z-index:1;max-width:900px;margin:0 auto;padding:60px 24px 80px; }

  /* Header */
  .header { margin-bottom:44px; }
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
    font-size:clamp(30px,5vw,48px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--purple) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Top layout: form + members grid */
  .top-layout { display:grid;grid-template-columns:1fr 1.5fr;gap:20px;margin-bottom:24px;align-items:start; }
  @media(max-width:660px){ .top-layout{grid-template-columns:1fr;} }

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
  .field-wrap { display:flex;flex-direction:column;gap:6px;margin-bottom:11px; }
  .field-label { font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600; }
  .field-icon-wrap { position:relative; }
  .field-icon { position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none; }
  input.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:11px;
    padding:11px 13px 11px 38px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;
    outline:none;transition:border-color .25s,background .25s,box-shadow .25s;
  }
  input.field::placeholder{color:rgba(255,255,255,0.22);}
  input.field:focus{
    border-color:rgba(167,139,250,0.45);background:rgba(167,139,250,0.03);
    box-shadow:0 0 0 4px rgba(167,139,250,0.07);
  }
  .row2 { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:11px; }

  /* Add button */
  button.btn-add {
    width:100%;margin-top:4px;
    background:linear-gradient(135deg,var(--purple),#8b5cf6);color:#fff;
    border:none;border-radius:11px;padding:13px;
    font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-add:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(167,139,250,0.3);}
  button.btn-add:active{transform:translateY(0);}
  button.btn-add::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent);pointer-events:none;}
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:8px;}
  .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Toast */
  .toast {
    display:flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.25);
    border-radius:10px;padding:10px 14px;margin-bottom:14px;
    font-size:13px;color:var(--accent);
  }

  /* Members grid */
  .members-wrap { display:flex;flex-direction:column;gap:10px; }
  .members-grid { display:flex;flex-wrap:wrap;gap:10px; }
  .member-btn {
    display:flex;align-items:center;gap:10px;
    background:rgba(255,255,255,0.03);border:1px solid var(--border);
    border-radius:14px;padding:12px 16px;
    cursor:pointer;transition:all .2s;
    font-family:'DM Sans',sans-serif;
  }
  .member-btn:hover{ border-color:rgba(167,139,250,0.3);background:rgba(167,139,250,0.05);transform:translateY(-1px); }
  .member-btn.active{ border-color:var(--purple);background:rgba(167,139,250,0.1); }
  .member-avatar {
    width:36px;height:36px;border-radius:10px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-size:18px;
  }
  .member-info { text-align:left; }
  .member-name { font-family:'Syne',sans-serif;font-size:13px;font-weight:700;margin-bottom:2px; }
  .member-rel  { font-size:11px;color:var(--muted); }

  /* Empty members */
  .members-empty { text-align:center;padding:28px 16px;color:var(--muted);font-size:13px; }

  /* Member detail panel */
  .detail-card {
    background:var(--glass);border:1px solid rgba(167,139,250,0.25);
    border-radius:20px;padding:26px 28px;
    position:relative;overflow:hidden;
    background:linear-gradient(135deg,rgba(167,139,250,0.05),rgba(0,180,255,0.03));
  }
  .detail-card::before{
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);
    pointer-events:none;
  }
  .detail-head { display:flex;align-items:center;gap:16px;margin-bottom:22px; }
  .detail-avatar {
    width:56px;height:56px;border-radius:16px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(167,139,250,0.25),rgba(0,180,255,0.2));
    border:1px solid rgba(167,139,250,0.3);
    display:flex;align-items:center;justify-content:center;font-size:26px;
  }
  .detail-name { font-family:'Syne',sans-serif;font-size:22px;font-weight:800;margin-bottom:4px; }
  .detail-meta { display:flex;gap:8px;flex-wrap:wrap; }
  .meta-chip {
    background:rgba(255,255,255,0.05);border:1px solid var(--border);
    border-radius:8px;padding:4px 11px;font-size:12px;color:var(--muted);
  }

  /* Detail sections */
  .detail-divider { height:1px;background:var(--border);margin:18px 0; }
  .detail-sections { display:grid;grid-template-columns:repeat(3,1fr);gap:12px; }
  @media(max-width:500px){ .detail-sections{grid-template-columns:1fr;} }
  .section-tile {
    background:rgba(255,255,255,0.03);border:1px solid var(--border);
    border-radius:14px;padding:16px;
    display:flex;flex-direction:column;align-items:center;gap:8px;
    cursor:pointer;transition:all .2s;text-align:center;
  }
  .section-tile:hover{ border-color:rgba(167,139,250,0.3);background:rgba(167,139,250,0.06);transform:translateY(-2px); }
  .section-tile-icon { font-size:24px; }
  .section-tile-label { font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:var(--text); }
  .section-tile-sub   { font-size:11px;color:var(--muted); }

  /* Skeleton */
  .skeleton { height:58px;border-radius:14px;
    background:linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 100%);
    background-size:200% 100%;animation:shimmer 1.6s infinite;
  }
  @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
`;

// Relation → avatar emoji
function getAvatar(relation = "", gender = "") {
  const r = relation.toLowerCase();
  const g = gender.toLowerCase();
  if (r.includes("father") || r.includes("dad"))  return "👨";
  if (r.includes("mother") || r.includes("mom"))  return "👩";
  if (r.includes("son")   || (r.includes("child") && g === "male"))   return "👦";
  if (r.includes("daughter") || (r.includes("child") && g === "female")) return "👧";
  if (r.includes("brother")) return "👱";
  if (r.includes("sister"))  return "👱‍♀️";
  if (r.includes("grand"))   return "🧓";
  return "🧑";
}

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };

const DETAIL_SECTIONS = [
  { icon:"📄", label:"Medical Records", sub:"Reports & history" },
  { icon:"💊", label:"Medicines",       sub:"Prescriptions" },
  { icon:"📅", label:"Appointments",    sub:"Upcoming visits" },
];

export default function FamilyDashboard() {
  const [members,  setMembers]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(false);
  const [form, setForm] = useState({ name:"", age:"", relation:"", gender:"" });

  const ownerId = "123"; // replace with logged-in user

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      setFetching(true);
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/${ownerId}`);
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setMembers(data.data || []);
      } catch {
        console.error("Not JSON 👉", text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addMember = async () => {
    if (!form.name || !form.age || !form.relation) return alert("Fill all required fields ❌");
    try {
      setLoading(true);
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ name:"", age:"", relation:"", gender:"" });
        setToast(true);
        setTimeout(() => setToast(false), 3000);
        fetchMembers();
      } else {
        alert("Failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Error ❌");
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
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> Family Health</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Family<br />Dashboard</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>Manage health records for every member of your family.</motion.p>
        </motion.div>

        <div className="top-layout">

          {/* ── Add Member Form ── */}
          <motion.div className="card"
            initial={{ opacity:0, y:28, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ delay:0.2, duration:0.5, ease:[0.22,1,0.36,1] }}>

            <div className="card-title"><span>Add Member</span><span className="line" /></div>

            <AnimatePresence>
              {toast && (
                <motion.div className="toast"
                  initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }} transition={{ duration:0.25 }}>
                  ✅ Member added successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <div className="field-wrap">
              <label className="field-label">Name</label>
              <div className="field-icon-wrap">
                <span className="field-icon">👤</span>
                <input className="field" name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
              </div>
            </div>

            <div className="row2">
              <div className="field-wrap" style={{ marginBottom:0 }}>
                <label className="field-label">Age</label>
                <div className="field-icon-wrap">
                  <span className="field-icon">🎂</span>
                  <input className="field" name="age" type="number" placeholder="e.g. 42" value={form.age} onChange={handleChange} />
                </div>
              </div>
              <div className="field-wrap" style={{ marginBottom:0 }}>
                <label className="field-label">Gender</label>
                <div className="field-icon-wrap">
                  <span className="field-icon">⚧</span>
                  <input className="field" name="gender" placeholder="Male / Female" value={form.gender} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="field-wrap" style={{ marginTop:"11px" }}>
              <label className="field-label">Relation</label>
              <div className="field-icon-wrap">
                <span className="field-icon">🫂</span>
                <input className="field" name="relation" placeholder="Father / Mother / Child…" value={form.relation} onChange={handleChange} />
              </div>
            </div>

            <motion.button className="btn-add"
              onClick={addMember} disabled={loading} whileTap={{ scale:0.97 }}>
              <span className="btn-inner">
                {loading ? <><div className="spinner" /> Adding…</> : <>＋ &nbsp;Add Member</>}
              </span>
            </motion.button>
          </motion.div>

          {/* ── Members list ── */}
          <motion.div className="card"
            initial={{ opacity:0, y:28, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ delay:0.3, duration:0.5, ease:[0.22,1,0.36,1] }}>

            <div className="card-title">
              <span>Family Members</span>
              {!fetching && <span style={{ marginLeft:"auto", marginRight:0, fontSize:"11px", color:"var(--muted)" }}>{members.length} member{members.length !== 1 ? "s" : ""}</span>}
              <span className="line" />
            </div>

            {fetching && (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" />)}
              </div>
            )}

            {!fetching && members.length === 0 && (
              <div className="members-empty">No family members added yet.</div>
            )}

            {!fetching && (
              <div className="members-grid">
                <AnimatePresence>
                  {members.map((m, i) => (
                    <motion.button key={m._id}
                      className={`member-btn ${selected?._id === m._id ? "active" : ""}`}
                      onClick={() => setSelected(m)}
                      initial={{ opacity:0, scale:0.9 }}
                      animate={{ opacity:1, scale:1 }}
                      transition={{ delay:i*0.07, duration:0.35, ease:[0.22,1,0.36,1] }}
                      whileTap={{ scale:0.95 }}>
                      <div className="member-avatar"
                        style={{ background:"linear-gradient(135deg,rgba(167,139,250,0.18),rgba(0,180,255,0.15))", border:"1px solid rgba(167,139,250,0.2)" }}>
                        {getAvatar(m.relation, m.gender)}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{m.name}</div>
                        <div className="member-rel">{m.relation}{m.age ? ` · ${m.age} yrs` : ""}</div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Selected member detail ── */}
        <AnimatePresence>
          {selected && (
            <motion.div className="detail-card"
              initial={{ opacity:0, y:28, scale:0.97 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-16, scale:0.96 }}
              transition={{ duration:0.45, ease:[0.22,1,0.36,1] }}
              layout>
              <div className="detail-head">
                <div className="detail-avatar">{getAvatar(selected.relation, selected.gender)}</div>
                <div>
                  <div className="detail-name">{selected.name}</div>
                  <div className="detail-meta">
                    <span className="meta-chip">🫂 {selected.relation}</span>
                    {selected.age   && <span className="meta-chip">🎂 {selected.age} yrs</span>}
                    {selected.gender && <span className="meta-chip">⚧ {selected.gender}</span>}
                  </div>
                </div>
              </div>

              <div className="detail-divider" />

              <div className="detail-sections">
                {DETAIL_SECTIONS.map(({ icon, label, sub }) => (
                  <motion.div key={label} className="section-tile"
                    whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                    <div className="section-tile-icon">{icon}</div>
                    <div className="section-tile-label">{label}</div>
                    <div className="section-tile-sub">{sub}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}