"use client";

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #06080f;
    --glass:   rgba(255,255,255,0.04);
    --border:  rgba(255,255,255,0.08);
    --accent:  #4fffb0;
    --accent2: #00b4ff;
    --text:    #e8ecf4;
    --muted:   rgba(232,236,244,0.45);
    --error:   #ff6b6b;
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
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.15;
    animation:drift 16s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:560px;height:560px;background:var(--accent2);top:-180px;right:-100px;animation-delay:0s;}
  .aurora span:nth-child(2){width:480px;height:480px;background:var(--accent);bottom:-120px;left:-80px;animation-delay:-7s;}
  .aurora span:nth-child(3){width:300px;height:300px;background:#818cf8;top:45%;left:50%;animation-delay:-12s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(40px,60px) scale(1.12);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* Layout */
  .page {
    position:relative;z-index:1;
    min-height:100vh;
    display:flex;align-items:center;justify-content:center;
    padding:40px 20px;
  }
  .wrapper { width:100%;max-width:400px; }

  /* Header */
  .header { text-align:center;margin-bottom:40px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(0,180,255,0.08);border:1px solid rgba(0,180,255,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent2);font-weight:600;margin-bottom:22px;
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
    font-size:clamp(32px,6vw,46px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.08;
    background:linear-gradient(135deg,#fff 30%,var(--accent2) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:12px;
  }
  .subtitle { color:var(--muted);font-size:14px;line-height:1.6;font-weight:300; }

  /* Card */
  .card {
    background:var(--glass);
    border:1px solid var(--border);
    border-radius:20px;padding:32px;
    backdrop-filter:blur(16px);
    position:relative;overflow:hidden;
  }
  .card::before {
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 60%);
    pointer-events:none;
  }
  .card-title {
    font-family:'Syne',sans-serif;
    font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    color:var(--muted);margin-bottom:22px;
    display:flex;align-items:center;gap:10px;
  }
  .card-title .line{flex:1;height:1px;background:var(--border);}

  /* Inputs */
  .input-wrap { position:relative;margin-bottom:14px; }
  .input-icon {
    position:absolute;left:16px;top:50%;transform:translateY(-50%);
    font-size:15px;pointer-events:none;z-index:1;
  }
  input.field {
    width:100%;background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:12px;
    padding:14px 16px 14px 44px;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;
    outline:none;transition:border-color .25s,background .25s,box-shadow .25s;
  }
  input.field::placeholder{color:rgba(255,255,255,0.25);}
  input.field:focus{
    border-color:rgba(0,180,255,0.5);
    background:rgba(0,180,255,0.04);
    box-shadow:0 0 0 4px rgba(0,180,255,0.07);
  }
  input.field.error-field{
    border-color:rgba(255,107,107,0.5);
    background:rgba(255,107,107,0.04);
  }

  /* Show/hide password toggle */
  .pw-toggle {
    position:absolute;right:14px;top:50%;transform:translateY(-50%);
    background:none;border:none;cursor:pointer;
    color:var(--muted);font-size:13px;padding:4px;
    transition:color .2s;z-index:1;
  }
  .pw-toggle:hover{color:var(--text);}

  /* Error message */
  .error-msg {
    background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);
    border-radius:10px;padding:11px 14px;
    font-size:13px;color:var(--error);
    display:flex;align-items:center;gap:8px;margin-bottom:14px;
  }

  /* Submit */
  button.btn-primary {
    width:100%;margin-top:4px;
    background:var(--accent2);color:#fff;
    border:none;border-radius:12px;
    padding:15px;font-family:'Syne',sans-serif;
    font-size:14px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-primary:disabled{opacity:.6;cursor:not-allowed;}
  button.btn-primary:not(:disabled):hover{
    transform:translateY(-2px);
    box-shadow:0 12px 40px rgba(0,180,255,0.35);
  }
  button.btn-primary:not(:disabled):active{transform:translateY(0);}
  button.btn-primary::after{
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent);
    pointer-events:none;
  }
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:10px;}
  .spinner{
    width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);
    border-top-color:#fff;border-radius:50%;
    animation:spin .7s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Footer */
  .divider {
    display:flex;align-items:center;gap:12px;
    margin:22px 0 0;color:var(--muted);font-size:12px;
  }
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border);}

  .footer-link {
    text-align:center;margin-top:16px;
    font-size:13px;color:var(--muted);
  }
  .footer-link a {
    color:var(--accent);text-decoration:none;font-weight:600;
    transition:opacity .2s;
  }
  .footer-link a:hover{opacity:.75;}
`;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg("Please fill all fields."); return; }
    setErrorMsg("");
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password }
      );
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      setErrorMsg("Invalid email or password. Please try again.");
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
        <div className="wrapper">

          {/* Header */}
          <motion.div className="header" variants={stagger} initial="hidden" animate="show">
            <motion.div className="badge" variants={item}>
              <span className="dot" /> Secure Login
            </motion.div>
            <motion.h1 className="title" variants={item}>
              Welcome<br />back
            </motion.h1>
            <motion.p className="subtitle" variants={item}>
              Continue your healthcare journey.
            </motion.p>
          </motion.div>

          {/* Card */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="card-title"><span>Credentials</span><span className="line" /></div>

            {/* Error */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  className="error-msg"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  ⚠️ {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <motion.div className="input-wrap"
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}>
              <span className="input-icon">📧</span>
              <input
                className={`field ${errorMsg ? "error-field" : ""}`}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(""); }}
              />
            </motion.div>

            {/* Password */}
            <motion.div className="input-wrap"
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}>
              <span className="input-icon">🔑</span>
              <input
                className={`field ${errorMsg ? "error-field" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrorMsg(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ paddingRight: "44px" }}
              />
              <button
                className="pw-toggle"
                type="button"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </motion.div>

            {/* Submit */}
            <motion.button
              className="btn-primary"
              onClick={handleLogin}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.46 }}
            >
              <span className="btn-inner">
                {loading
                  ? <><div className="spinner" /> Signing in…</>
                  : <>🚀 &nbsp;Sign In</>
                }
              </span>
            </motion.button>

            <div className="divider">or</div>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="footer-link"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Don't have an account? <Link href="/register">Create one</Link>
          </motion.p>

        </div>
      </div>
    </>
  );
}