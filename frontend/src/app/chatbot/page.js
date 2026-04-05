"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --accent:  #4fffb0;
    --accent2: #00b4ff;
    --text:    #e8ecf4;
    --muted:   rgba(232,236,244,0.45);
    --border:  rgba(255,255,255,0.08);
    --glass:   rgba(255,255,255,0.04);
    --user-bg: linear-gradient(135deg,#0072ff,#00b4ff);
    --bot-bg:  rgba(255,255,255,0.06);
  }

  /* Aurora */
  .ch-aurora { position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0; }
  .ch-aurora span {
    position:absolute;border-radius:50%;filter:blur(130px);opacity:0.13;
    animation:ch-drift 18s ease-in-out infinite alternate;
  }
  .ch-aurora span:nth-child(1){width:560px;height:560px;background:#0072ff;top:-180px;right:-80px;animation-delay:0s;}
  .ch-aurora span:nth-child(2){width:480px;height:480px;background:var(--accent);bottom:-140px;left:-100px;animation-delay:-9s;}
  .ch-aurora span:nth-child(3){width:300px;height:300px;background:#a855f7;top:50%;left:48%;animation-delay:-15s;}
  @keyframes ch-drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,65px) scale(1.1);}}

  /* Noise */
  .ch-noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* ── SHELL: fixed full-screen, independent of any parent ── */
  .ch-shell {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    background: #06080f;
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
  }

  /* Inner centred column */
  .ch-inner {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  /* ── TOP BAR ── */
  .ch-topbar {
    flex-shrink: 0;
    padding: 20px 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .ch-topbar-left { display:flex; align-items:center; gap:14px; }
  .ch-bot-avatar {
    width:42px; height:42px; border-radius:12px; flex-shrink:0;
    background: linear-gradient(135deg,rgba(79,255,176,0.25),rgba(0,180,255,0.25));
    border: 1px solid rgba(79,255,176,0.3);
    display:flex; align-items:center; justify-content:center; font-size:20px;
  }
  .ch-bot-name   { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; margin-bottom:2px; }
  .ch-bot-status { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--accent); font-weight:500; }
  .ch-status-dot {
    width:6px; height:6px; border-radius:50%; background:var(--accent);
    animation: ch-pulse 2s infinite;
  }
  @keyframes ch-pulse{
    0%,100%{box-shadow:0 0 0 0 rgba(79,255,176,0.6);}
    50%{box-shadow:0 0 0 5px rgba(79,255,176,0);}
  }
  .ch-badge {
    background:rgba(79,255,176,0.08); border:1px solid rgba(79,255,176,0.2);
    border-radius:100px; padding:5px 14px;
    font-size:11px; letter-spacing:.1em; text-transform:uppercase;
    color:var(--accent); font-weight:600;
  }

  /* ── MESSAGES ── */
  .ch-messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .ch-messages::-webkit-scrollbar { width:3px; }
  .ch-messages::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

  /* Welcome */
  .ch-welcome { text-align:center; margin:auto; padding:40px 20px; }
  .ch-welcome-icon { font-size:48px; margin-bottom:16px; }
  .ch-welcome-title {
    font-family:'Syne',sans-serif; font-size:22px; font-weight:800;
    letter-spacing:-0.02em; margin-bottom:10px;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .ch-welcome-sub { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:24px; }
  .ch-chips { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
  .ch-chip {
    background:var(--glass); border:1px solid var(--border);
    border-radius:100px; padding:8px 16px;
    font-size:12px; color:var(--muted); cursor:pointer; transition:all .2s;
    font-family:'DM Sans',sans-serif;
  }
  .ch-chip:hover { border-color:rgba(79,255,176,0.35); color:var(--text); background:rgba(79,255,176,0.06); }

  /* ── ROW ── */
  .ch-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
  }
  .ch-row.user { flex-direction: row-reverse; }

  /* Avatar */
  .ch-av {
    width:30px; height:30px; border-radius:8px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; font-size:14px;
  }
  .ch-av.bot { background:linear-gradient(135deg,rgba(79,255,176,0.15),rgba(0,180,255,0.15)); border:1px solid rgba(79,255,176,0.2); }
  .ch-av.user { background:linear-gradient(135deg,rgba(0,114,255,0.2),rgba(0,180,255,0.2)); border:1px solid rgba(0,180,255,0.2); }

  /* Bubble wrapper — this is the key sizing element */
  .ch-bwrap {
    min-width: 0;
    max-width: calc(100% - 40px);
    display: flex;
    flex-direction: column;
  }
  .ch-row.user .ch-bwrap { align-items: flex-end; }
  .ch-row.bot  .ch-bwrap { align-items: flex-start; }

  /* Bubble */
  .ch-bubble {
    display: inline-block;
    max-width: 100%;
    padding: 11px 15px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.65;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    box-sizing: border-box;
  }
  .ch-bubble.user {
    background: var(--user-bg);
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .ch-bubble.bot {
    background: var(--bot-bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
  }

  /* Urgent bubble */
  .ch-bubble.urgent {
    background: rgba(255,107,107,0.08);
    border: 1px solid rgba(255,107,107,0.28);
    border-bottom-left-radius: 4px;
    color: var(--text);
  }
  .ch-urgent-label {
    display:flex; align-items:center; gap:6px;
    font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
    letter-spacing:.08em; text-transform:uppercase;
    color:#ff6b6b; margin-bottom:6px;
  }
  .ch-urgent-dot {
    width:7px; height:7px; border-radius:50%; background:#ff6b6b;
    animation: ch-blink 1.2s ease-in-out infinite;
  }
  @keyframes ch-blink { 0%,100%{opacity:1;} 50%{opacity:.3;} }

  /* Doctors bubble */
  .ch-bubble.doctors {
    background: rgba(79,255,176,0.05);
    border: 1px solid rgba(79,255,176,0.18);
    border-bottom-left-radius: 4px;
    color: var(--text);
    min-width: 220px;
  }
  .ch-doc-label {
    font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
    letter-spacing:.08em; text-transform:uppercase;
    color:var(--accent); margin-bottom:10px;
  }
  .ch-doc-row {
    display:flex; align-items:center; gap:10px;
    padding:8px 0; border-bottom:1px solid rgba(79,255,176,0.08);
  }
  .ch-doc-row:last-child { border-bottom:none; padding-bottom:0; }
  .ch-doc-av {
    width:28px; height:28px; border-radius:7px; flex-shrink:0;
    background:linear-gradient(135deg,rgba(79,255,176,0.15),rgba(0,180,255,0.15));
    border:1px solid rgba(79,255,176,0.18);
    display:flex; align-items:center; justify-content:center; font-size:13px;
  }
  .ch-doc-name { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; margin-bottom:2px; }
  .ch-doc-exp  { font-size:11px; color:var(--muted); }

  /* Timestamp */
  .ch-time { font-size:10px; margin-top:4px; color:var(--muted); }
  .ch-row.user .ch-time { text-align:right; color:rgba(255,255,255,0.3); }

  /* Typing */
  .ch-typing {
    background:var(--bot-bg); border:1px solid var(--border);
    border-radius:16px; border-bottom-left-radius:4px;
    padding:14px 18px; display:flex; align-items:center; gap:5px;
  }
  .ch-dot {
    width:7px; height:7px; border-radius:50%; background:var(--muted);
    animation: ch-bounce 1.2s infinite ease-in-out;
  }
  .ch-dot:nth-child(2){animation-delay:.2s;}
  .ch-dot:nth-child(3){animation-delay:.4s;}
  @keyframes ch-bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}

  /* ── INPUT BAR ── */
  .ch-inputbar {
    flex-shrink: 0;
    padding: 14px 0 20px;
    border-top: 1px solid var(--border);
  }
  .ch-inputwrap {
    display:flex; align-items:center; gap:10px;
    background:rgba(255,255,255,0.04);
    border:1px solid var(--border); border-radius:14px;
    padding:6px 6px 6px 18px;
    transition:border-color .25s, box-shadow .25s;
  }
  .ch-inputwrap:focus-within {
    border-color:rgba(79,255,176,0.4);
    box-shadow:0 0 0 4px rgba(79,255,176,0.06);
  }
  .ch-input {
    flex:1; background:transparent; border:none; outline:none;
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; padding:8px 0;
  }
  .ch-input::placeholder { color:rgba(255,255,255,0.22); }
  .ch-send {
    width:40px; height:40px; border-radius:10px; flex-shrink:0;
    background:var(--accent); color:#06080f; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:16px;
    transition:transform .2s, box-shadow .2s, background .2s;
  }
  .ch-send:disabled { background:var(--border); cursor:not-allowed; color:var(--muted); }
  .ch-send:not(:disabled):hover { transform:scale(1.08); box-shadow:0 6px 20px rgba(79,255,176,0.35); }
  .ch-send:not(:disabled):active { transform:scale(0.96); }
  .ch-hint { text-align:center; font-size:11px; color:var(--muted); margin-top:10px; }
`;

const QUICK = [
  "I have a headache 🤕",
  "Chest pain when breathing",
  "Feeling dizzy & tired",
  "Stomach ache after meals",
];

function ts() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Bubble({ msg }) {
  if (msg.type === "urgent") {
    return (
      <div className="ch-bubble urgent">
        <div className="ch-urgent-label"><span className="ch-urgent-dot" />Urgent</div>
        {msg.text}
      </div>
    );
  }
  if (msg.type === "doctors" && msg.doctors?.length > 0) {
    return (
      <div className="ch-bubble doctors">
        <div className="ch-doc-label">Recommended Doctors</div>
        {msg.doctors.map((d, i) => (
          <div key={i} className="ch-doc-row">
            <div className="ch-doc-av">👨‍⚕️</div>
            <div>
              <div className="ch-doc-name">{d.name}</div>
              <div className="ch-doc-exp">{d.specialization} · {d.experience} yrs{d.rating ? ` · ★ ${d.rating}` : ""}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`ch-bubble ${msg.sender}`}>{msg.text}</div>
  );
}

const rowAnim = {
  hidden: (s) => ({ opacity: 0, x: s === "user" ? 20 : -20, scale: 0.95 }),
  show:   { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: [0.22,1,0.36,1] } },
};

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const getBotResponse = async (message) => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      return { ...data, reply: (data.reply || "").replace(/\n/g, " ") };
    } catch {
      return { reply: "Server error ❌", specialist: "general_physician", urgent: false };
    }
  };

  const sendMessage = async (text) => {
    const msg = (text ?? input).replace(/\n/g, "").replace(/\s+/g, " ").trim();
    if (!msg) return;

    setMessages(prev => [...prev, { text: msg, sender: "user", time: ts() }]);
    setInput("");
    setTyping(true);

    const ai = await getBotResponse(msg);
    setTyping(false);

    setMessages(prev => [...prev, { text: ai.reply, sender: "bot", time: ts() }]);

    if (ai.urgent) {
      setMessages(prev => [...prev, {
        type: "urgent",
        text: "This might be serious. Please consult a doctor immediately.",
        sender: "bot", time: ts()
      }]);
    }

    const specialist = (ai.specialist || "general_physician").toLowerCase().replace(/\s+/g, "_");
    try {
      console.log("FETCHING 👉", specialist);
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors/${specialist}`);
      const data    = await res.json();
      const doctors = Array.isArray(data) ? data : data.doctors || [];
      console.log("DOCTORS 👉", doctors);
      if (doctors.length > 0) {
        setMessages(prev => [...prev, { type: "doctors", doctors: doctors.slice(0, 3), sender: "bot", time: ts() }]);
      }
    } catch (err) {
      console.log("Doctor fetch error", err);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="ch-aurora"><span /><span /><span /></div>
      <div className="ch-noise" />

      {/* Fixed full-screen shell — immune to parent layout sizing */}
      <div className="ch-shell">
        <div className="ch-inner">

          {/* Top bar */}
          <motion.div className="ch-topbar"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>
            <div className="ch-topbar-left">
              <div className="ch-bot-avatar">🤖</div>
              <div>
                <div className="ch-bot-name">AI Health Assistant</div>
                <div className="ch-bot-status">
                  <span className="ch-status-dot" />
                  {typing ? "Typing…" : "Online"}
                </div>
              </div>
            </div>
            <div className="ch-badge">AI Powered</div>
          </motion.div>

          {/* Messages */}
          <div className="ch-messages">
            {messages.length === 0 && (
              <motion.div className="ch-welcome"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}>
                <div className="ch-welcome-icon">🩺</div>
                <div className="ch-welcome-title">How can I help you today?</div>
                <div className="ch-welcome-sub">
                  Describe your symptoms and I'll help you<br />understand what might be going on.
                </div>
                <div className="ch-chips">
                  {QUICK.map((q, i) => (
                    <motion.button key={i} className="ch-chip"
                      onClick={() => sendMessage(q)}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 + i * 0.07 }}
                      whileTap={{ scale: 0.95 }}>
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  className={`ch-row ${msg.sender}`}
                  custom={msg.sender}
                  variants={rowAnim}
                  initial="hidden" animate="show">
                  <div className={`ch-av ${msg.sender === "bot" ? "bot" : "user"}`}>
                    {msg.sender === "bot" ? (msg.type === "urgent" ? "⚠️" : "🤖") : "👤"}
                  </div>
                  <div className="ch-bwrap">
                    <Bubble msg={msg} />
                    <div className="ch-time">{msg.time}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {typing && (
                <motion.div className="ch-row bot"
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                  <div className="ch-av bot">🤖</div>
                  <div className="ch-typing">
                    <span className="ch-dot" /><span className="ch-dot" /><span className="ch-dot" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <motion.div className="ch-inputbar"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}>
            <div className="ch-inputwrap">
              <input className="ch-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask about symptoms…"
                disabled={typing} />
              <motion.button className="ch-send"
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                whileTap={{ scale: 0.92 }}>
                ➤
              </motion.button>
            </div>
            <div className="ch-hint">Press Enter to send · AI responses are not medical advice</div>
          </motion.div>

        </div>
      </div>
    </>
  );
}