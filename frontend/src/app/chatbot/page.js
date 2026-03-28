"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    --user-bg: linear-gradient(135deg,#0072ff,#00b4ff);
    --bot-bg:  rgba(255,255,255,0.06);
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
    position:absolute;border-radius:50%;filter:blur(130px);opacity:0.13;
    animation:drift 18s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:560px;height:560px;background:#0072ff;top:-180px;right:-80px;animation-delay:0s;}
  .aurora span:nth-child(2){width:480px;height:480px;background:var(--accent);bottom:-140px;left:-100px;animation-delay:-9s;}
  .aurora span:nth-child(3){width:300px;height:300px;background:#a855f7;top:50%;left:48%;animation-delay:-15s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,65px) scale(1.1);}}

  /* Noise */
  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* Page — full viewport chat layout */
  .page {
    position:relative;z-index:1;
    height:100vh;
    display:flex;flex-direction:column;
    max-width:720px;margin:0 auto;
    padding:0 20px;
  }

  /* ── TOP BAR ── */
  .topbar {
    flex-shrink:0;
    padding:24px 0 20px;
    display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid var(--border);
  }
  .topbar-left { display:flex;align-items:center;gap:14px; }
  .bot-avatar {
    width:42px;height:42px;border-radius:12px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(79,255,176,0.25),rgba(0,180,255,0.25));
    border:1px solid rgba(79,255,176,0.3);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }
  .bot-name {
    font-family:'Syne',sans-serif;font-size:16px;font-weight:700;
    margin-bottom:2px;
  }
  .bot-status {
    display:flex;align-items:center;gap:6px;
    font-size:11px;color:var(--accent);font-weight:500;
  }
  .status-dot {
    width:6px;height:6px;border-radius:50%;background:var(--accent);
    animation:pulse-dot 2s infinite;
  }
  @keyframes pulse-dot{
    0%,100%{box-shadow:0 0 0 0 rgba(79,255,176,0.6);}
    50%{box-shadow:0 0 0 5px rgba(79,255,176,0);}
  }
  .badge {
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:5px 14px;
    font-size:11px;letter-spacing:.1em;text-transform:uppercase;
    color:var(--accent);font-weight:600;
  }

  /* ── MESSAGE AREA ── */
  .messages {
    flex:1;overflow-y:auto;
    padding:24px 0;
    display:flex;flex-direction:column;gap:12px;
    scrollbar-width:thin;scrollbar-color:var(--border) transparent;
  }
  .messages::-webkit-scrollbar{width:3px;}
  .messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}

  /* Welcome */
  .welcome {
    text-align:center;margin:auto;padding:40px 20px;
  }
  .welcome-icon { font-size:48px;margin-bottom:16px; }
  .welcome-title {
    font-family:'Syne',sans-serif;font-size:22px;font-weight:800;
    letter-spacing:-0.02em;margin-bottom:10px;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  }
  .welcome-sub { color:var(--muted);font-size:14px;line-height:1.6;margin-bottom:24px; }
  .quick-chips { display:flex;flex-wrap:wrap;gap:8px;justify-content:center; }
  .chip {
    background:var(--glass);border:1px solid var(--border);
    border-radius:100px;padding:8px 16px;
    font-size:12px;color:var(--muted);
    cursor:pointer;transition:all .2s;
  }
  .chip:hover{
    border-color:rgba(79,255,176,0.35);color:var(--text);
    background:rgba(79,255,176,0.06);
  }

  /* Row */
  .msg-row {
    display:flex;align-items:flex-end;gap:10px;
  }
  .msg-row.user { flex-direction:row-reverse; }

  /* Avatar */
  .msg-avatar {
    width:30px;height:30px;border-radius:8px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-size:14px;
  }
  .msg-avatar.bot-av {
    background:linear-gradient(135deg,rgba(79,255,176,0.15),rgba(0,180,255,0.15));
    border:1px solid rgba(79,255,176,0.2);
  }
  .msg-avatar.user-av {
    background:linear-gradient(135deg,rgba(0,114,255,0.2),rgba(0,180,255,0.2));
    border:1px solid rgba(0,180,255,0.2);
  }

  /* Bubble */
  .bubble {
    max-width:72%;padding:12px 16px;border-radius:16px;
    font-size:14px;line-height:1.65;word-break:break-word;
    position:relative;
  }
  .bubble.user {
    background:var(--user-bg);color:#fff;
    border-bottom-right-radius:4px;
  }
  .bubble.bot {
    background:var(--bot-bg);color:var(--text);
    border:1px solid var(--border);
    border-bottom-left-radius:4px;
  }
  .bubble-time {
    font-size:10px;color:rgba(255,255,255,0.35);margin-top:5px;
  }
  .bubble.bot .bubble-time { color:var(--muted); }

  /* Typing dots */
  .typing-bubble {
    background:var(--bot-bg);
    border:1px solid var(--border);
    border-radius:16px;border-bottom-left-radius:4px;
    padding:14px 18px;
    display:flex;align-items:center;gap:5px;
  }
  .typing-dot {
    width:7px;height:7px;border-radius:50%;background:var(--muted);
    animation:bounce 1.2s infinite ease-in-out;
  }
  .typing-dot:nth-child(2){animation-delay:.2s;}
  .typing-dot:nth-child(3){animation-delay:.4s;}
  @keyframes bounce{
    0%,80%,100%{transform:translateY(0);}
    40%{transform:translateY(-6px);}
  }

  /* ── INPUT BAR ── */
  .input-bar {
    flex-shrink:0;
    padding:16px 0 24px;
    border-top:1px solid var(--border);
  }
  .input-wrap {
    display:flex;align-items:center;gap:10px;
    background:rgba(255,255,255,0.04);
    border:1px solid var(--border);border-radius:14px;
    padding:6px 6px 6px 18px;
    transition:border-color .25s,box-shadow .25s;
  }
  .input-wrap:focus-within{
    border-color:rgba(79,255,176,0.4);
    box-shadow:0 0 0 4px rgba(79,255,176,0.06);
  }
  input.chat-input {
    flex:1;background:transparent;border:none;outline:none;
    color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;
    padding:8px 0;
  }
  input.chat-input::placeholder{color:rgba(255,255,255,0.22);}
  button.send-btn {
    width:40px;height:40px;border-radius:10px;flex-shrink:0;
    background:var(--accent);color:#06080f;
    border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
    transition:transform .2s,box-shadow .2s,background .2s;
  }
  button.send-btn:disabled{background:var(--border);cursor:not-allowed;color:var(--muted);}
  button.send-btn:not(:disabled):hover{
    transform:scale(1.08);
    box-shadow:0 6px 20px rgba(79,255,176,0.35);
  }
  button.send-btn:not(:disabled):active{transform:scale(0.96);}
  .hint { text-align:center;font-size:11px;color:var(--muted);margin-top:10px; }
`;

const QUICK = [
  "I have a headache 🤕",
  "Chest pain when breathing",
  "Feeling dizzy & tired",
  "Stomach ache after meals",
];

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const bubbleAnim = {
  hidden: (sender) => ({
    opacity: 0,
    x: sender === "user" ? 20 : -20,
    scale: 0.95,
  }),
  show: {
    opacity: 1, x: 0, scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const getBotResponse = async (message) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      return data.reply;
    } catch (err) {
      return "Server error ❌";
    }
  };

  const sendMessage = async (text) => {
    const msg = text ?? input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { text: msg, sender: "user", time: timestamp() }]);
    setInput("");
    setTyping(true);

    const reply = await getBotResponse(msg);

    setTyping(false);
    setMessages(prev => [...prev, { text: reply, sender: "bot", time: timestamp() }]);
  };

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Top bar */}
        <motion.div
          className="topbar"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="topbar-left">
            <div className="bot-avatar">🤖</div>
            <div>
              <div className="bot-name">AI Health Assistant</div>
              <div className="bot-status">
                <span className="status-dot" />
                {typing ? "Typing…" : "Online"}
              </div>
            </div>
          </div>
          <div className="badge">AI Powered</div>
        </motion.div>

        {/* Messages */}
        <div className="messages">
          {/* Welcome */}
          {messages.length === 0 && (
            <motion.div
              className="welcome"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="welcome-icon">🩺</div>
              <div className="welcome-title">How can I help you today?</div>
              <div className="welcome-sub">
                Describe your symptoms and I'll help you<br />understand what might be going on.
              </div>
              <div className="quick-chips">
                {QUICK.map((q, i) => (
                  <motion.button
                    key={i} className="chip"
                    onClick={() => sendMessage(q)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message list */}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`msg-row ${msg.sender}`}
                custom={msg.sender}
                variants={bubbleAnim}
                initial="hidden"
                animate="show"
              >
                <div className={`msg-avatar ${msg.sender === "bot" ? "bot-av" : "user-av"}`}>
                  {msg.sender === "bot" ? "🤖" : "👤"}
                </div>
                <div>
                  <div className={`bubble ${msg.sender}`}>{msg.text}</div>
                  <div className="bubble-time" style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
                    {msg.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div
                className="msg-row bot"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="msg-avatar bot-av">🤖</div>
                <div className="typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <motion.div
          className="input-bar"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="input-wrap">
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask about symptoms…"
              disabled={typing}
            />
            <motion.button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              whileTap={{ scale: 0.92 }}
            >
              ➤
            </motion.button>
          </div>
          <div className="hint">Press Enter to send · AI responses are not medical advice</div>
        </motion.div>

      </div>
    </>
  );
}