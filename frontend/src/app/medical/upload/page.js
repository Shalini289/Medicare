"use client";

import { useState, useRef } from "react";
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

  /* Aurora */
  .aurora { position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0; }
  .aurora span {
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.13;
    animation:drift 18s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:560px;height:560px;background:var(--accent);top:-180px;left:-100px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--purple);bottom:-140px;right:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:320px;height:320px;background:var(--accent2);top:45%;left:52%;animation-delay:-14s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,65px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .page { position:relative;z-index:1;max-width:560px;margin:0 auto;padding:60px 24px 80px; }

  /* Header */
  .header { margin-bottom:44px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent);font-weight:600;margin-bottom:20px;
  }
  .badge .dot { width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse-dot 2s infinite; }
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(79,255,176,0.6);}50%{box-shadow:0 0 0 6px rgba(79,255,176,0);}}
  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(30px,5vw,46px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:10px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Card */
  .card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:28px 32px;
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
    margin-bottom:22px;display:flex;align-items:center;gap:10px;
  }
  .card-title .line{flex:1;height:1px;background:var(--border);}

  /* Drop zone */
  .dropzone {
    border:2px dashed rgba(79,255,176,0.2);border-radius:14px;
    padding:36px 20px;text-align:center;cursor:pointer;
    background:rgba(79,255,176,0.03);
    transition:border-color .25s,background .25s;
    margin-bottom:20px;position:relative;
  }
  .dropzone:hover, .dropzone.drag-over {
    border-color:rgba(79,255,176,0.5);
    background:rgba(79,255,176,0.06);
  }
  .dropzone input[type=file]{
    position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;
  }
  .dz-icon { font-size:36px;margin-bottom:10px; }
  .dz-title { font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:5px; }
  .dz-sub { font-size:12px;color:var(--muted); }

  /* File preview pill */
  .file-pill {
    display:flex;align-items:center;gap:10px;
    background:rgba(79,255,176,0.07);border:1px solid rgba(79,255,176,0.2);
    border-radius:10px;padding:10px 14px;margin-bottom:20px;
  }
  .file-pill-icon { font-size:18px; }
  .file-pill-name { font-size:13px;font-weight:500;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
  .file-pill-size { font-size:11px;color:var(--muted);flex-shrink:0; }
  .file-pill-remove {
    background:none;border:none;cursor:pointer;color:var(--muted);
    font-size:16px;line-height:1;padding:0 2px;transition:color .2s;flex-shrink:0;
  }
  .file-pill-remove:hover{color:#ff6b6b;}

  /* Input fields */
  .row { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px; }
  @media(max-width:480px){ .row{grid-template-columns:1fr;} }
  .field-wrap { display:flex;flex-direction:column;gap:6px;margin-bottom:14px; }
  .field-wrap.no-mb { margin-bottom:0; }
  .field-label { font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600; }
  .field-icon-wrap { position:relative; }
  .field-icon { position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none; }
  .field-icon.top { top:16px;transform:none; }
  input.field, textarea.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:11px;
    padding:12px 13px 12px 40px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;
    outline:none;transition:border-color .25s,background .25s,box-shadow .25s;
  }
  textarea.field { resize:vertical;min-height:90px;padding-top:13px;line-height:1.6; }
  input.field::placeholder, textarea.field::placeholder{color:rgba(255,255,255,0.22);}
  input.field:focus, textarea.field:focus{
    border-color:rgba(79,255,176,0.5);background:rgba(79,255,176,0.04);
    box-shadow:0 0 0 4px rgba(79,255,176,0.07);
  }

  /* Upload button */
  button.btn-upload {
    width:100%;margin-top:8px;
    background:var(--accent);color:#06080f;
    border:none;border-radius:12px;padding:15px;
    font-family:'Syne',sans-serif;font-size:14px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-upload:disabled{opacity:.55;cursor:not-allowed;}
  button.btn-upload:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(79,255,176,0.35);}
  button.btn-upload:not(:disabled):active{transform:translateY(0);}
  button.btn-upload::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.22),transparent);pointer-events:none;}
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:10px;}
  .spinner{width:16px;height:16px;border:2px solid rgba(6,8,15,0.25);border-top-color:#06080f;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Progress bar */
  .progress-wrap { margin-top:14px; }
  .progress-label { font-size:11px;color:var(--muted);margin-bottom:6px;display:flex;justify-content:space-between; }
  .progress-track { height:4px;border-radius:2px;background:var(--border);overflow:hidden; }
  .progress-fill { height:100%;border-radius:2px;background:linear-gradient(90deg,var(--accent),#00e68a); }

  /* Success toast */
  .toast {
    display:flex;align-items:center;gap:10px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.25);
    border-radius:12px;padding:13px 16px;margin-bottom:20px;
    font-size:13px;color:var(--accent);
  }
`;

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name = "") {
  const ext = name.split(".").pop().toLowerCase();
  if (["jpg","jpeg","png","webp","gif"].includes(ext)) return "🖼️";
  if (ext === "pdf") return "📄";
  if (["doc","docx"].includes(ext)) return "📝";
  if (["xls","xlsx","csv"].includes(ext)) return "📊";
  return "📎";
}

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };

export default function UploadReport() {
  const [file,     setFile]     = useState(null);
  const [drag,     setDrag]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [success,  setSuccess]  = useState(false);
  const [form, setForm] = useState({ patientId:"", doctorId:"", reportType:"", notes:"" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    try {
      setLoading(true); setProgress(0); setSuccess(false);

      // Simulate progress
      const tick = setInterval(() => setProgress(p => { if (p >= 90) { clearInterval(tick); return 90; } return p + 12; }), 200);

      const formData = new FormData();
      formData.append("file",       file);
      formData.append("patientId",  form.patientId);
      formData.append("doctorId",   form.doctorId);
      formData.append("reportType", form.reportType);
      formData.append("notes",      form.notes);

      const res  = await fetch("http://localhost:5000/api/medical/upload", { method:"POST", body:formData });
      const data = await res.json();

      clearInterval(tick);
      setProgress(100);
      console.log(data);

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setSuccess(true);
        setFile(null);
        setForm({ patientId:"", doctorId:"", reportType:"", notes:"" });
        setTimeout(() => setSuccess(false), 4000);
      }, 400);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
      setLoading(false); setProgress(0);
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
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> Medical Upload</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Upload<br />Report</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>Securely upload patient medical reports and documents.</motion.p>
        </motion.div>

        {/* Success toast */}
        <AnimatePresence>
          {success && (
            <motion.div className="toast"
              initial={{ opacity:0, y:-12, height:0 }}
              animate={{ opacity:1, y:0, height:"auto" }}
              exit={{ opacity:0, y:-12, height:0 }}
              transition={{ duration:0.3 }}>
              ✅ Report uploaded successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card */}
        <motion.div className="card"
          initial={{ opacity:0, y:28, scale:0.97 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ delay:0.2, duration:0.5, ease:[0.22,1,0.36,1] }}>

          <div className="card-title"><span>Upload Details</span><span className="line" /></div>

          {/* Drop zone */}
          {!file ? (
            <motion.div
              className={`dropzone ${drag ? "drag-over" : ""}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              whileHover={{ scale:1.01 }}
            >
              <input type="file" onChange={handleFileChange} />
              <div className="dz-icon">📂</div>
              <div className="dz-title">Drop your file here</div>
              <div className="dz-sub">or click to browse · PDF, images, docs supported</div>
            </motion.div>
          ) : (
            <motion.div className="file-pill"
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.3 }}>
              <span className="file-pill-icon">{getFileIcon(file.name)}</span>
              <span className="file-pill-name">{file.name}</span>
              <span className="file-pill-size">{formatBytes(file.size)}</span>
              <button className="file-pill-remove" onClick={() => setFile(null)}>✕</button>
            </motion.div>
          )}

          {/* Patient + Doctor IDs */}
          <div className="row">
            <div className="field-wrap no-mb">
              <label className="field-label">Patient ID</label>
              <div className="field-icon-wrap">
                <span className="field-icon">🧑‍⚕️</span>
                <input className="field" type="text" name="patientId"
                  placeholder="e.g. PAT-001" value={form.patientId} onChange={handleChange} />
              </div>
            </div>
            <div className="field-wrap no-mb">
              <label className="field-label">Doctor ID</label>
              <div className="field-icon-wrap">
                <span className="field-icon">👨‍⚕️</span>
                <input className="field" type="text" name="doctorId"
                  placeholder="e.g. DOC-042" value={form.doctorId} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Report type */}
          <div className="field-wrap">
            <label className="field-label">Report Type</label>
            <div className="field-icon-wrap">
              <span className="field-icon">🧠</span>
              <input className="field" type="text" name="reportType"
                placeholder="e.g. X-Ray, Blood Test, MRI" value={form.reportType} onChange={handleChange} />
            </div>
          </div>

          {/* Notes */}
          <div className="field-wrap">
            <label className="field-label">Notes</label>
            <div className="field-icon-wrap">
              <span className="field-icon top">📝</span>
              <textarea className="field" name="notes"
                placeholder="Additional notes or observations…"
                value={form.notes} onChange={handleChange} />
            </div>
          </div>

          {/* Upload button */}
          <motion.button
            className="btn-upload"
            onClick={handleUpload}
            disabled={loading}
            whileTap={{ scale:0.97 }}
          >
            <span className="btn-inner">
              {loading
                ? <><div className="spinner" /> Uploading…</>
                : <>⬆️ &nbsp;Upload Report</>
              }
            </span>
          </motion.button>

          {/* Progress bar */}
          <AnimatePresence>
            {loading && (
              <motion.div className="progress-wrap"
                initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                exit={{ opacity:0, height:0 }} transition={{ duration:0.25 }}>
                <div className="progress-label">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-track">
                  <motion.div className="progress-fill"
                    animate={{ width:`${progress}%` }}
                    transition={{ duration:0.3 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </>
  );
}