"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

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
    max-width:720px;margin:0 auto;padding:60px 24px 40px;
    display:flex;flex-direction:column;height:100vh;
  }

  /* Header */
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent);font-weight:600;margin-bottom:20px;
    width:fit-content;
  }
  .badge .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse-dot 2s infinite;}
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(79,255,176,0.6);}50%{box-shadow:0 0 0 6px rgba(79,255,176,0);}}

  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(26px,4vw,40px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:6px;
  }
  .subtitle{color:var(--muted);font-size:13px;font-weight:300;margin-bottom:24px;}

  /* Chat panel */
  .chat-panel {
    flex:1;display:flex;flex-direction:column;
    background:var(--glass);border:1px solid var(--border);
    border-radius:24px;overflow:hidden;position:relative;
  }
  .chat-panel::before{
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 55%);
    pointer-events:none;z-index:0;
  }

  /* Chat header bar */
  .chat-header {
    display:flex;align-items:center;gap:14px;
    padding:18px 22px;border-bottom:1px solid var(--border);
    position:relative;z-index:1;flex-shrink:0;
  }
  .avatar {
    width:40px;height:40px;border-radius:12px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(0,180,255,0.25),rgba(79,255,176,0.15));
    border:1px solid rgba(0,180,255,0.25);
    display:flex;align-items:center;justify-content:center;
    font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--accent2);
  }
  .chat-header-info{flex:1;}
  .chat-header-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;}
  .chat-header-status{font-size:11px;color:var(--accent);display:flex;align-items:center;gap:5px;}
  .online-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);animation:pulse-dot 2s infinite;}

  /* Messages area */
  .messages-area {
    flex:1;overflow-y:auto;padding:20px 22px;
    display:flex;flex-direction:column;gap:10px;
    position:relative;z-index:1;
  }
  .messages-area::-webkit-scrollbar{width:4px;}
  .messages-area::-webkit-scrollbar-track{background:transparent;}
  .messages-area::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px;}

  /* Message bubbles */
  .msg-row { display:flex;flex-direction:column; }
  .msg-row.me  { align-items:flex-end; }
  .msg-row.them{ align-items:flex-start; }

  .bubble {
    max-width:72%;padding:10px 16px;border-radius:16px;
    font-size:14px;line-height:1.5;position:relative;word-break:break-word;
  }
  .me .bubble {
    background:rgba(79,255,176,0.12);border:1px solid rgba(79,255,176,0.2);
    border-bottom-right-radius:4px;color:var(--text);
  }
  .them .bubble {
    background:rgba(255,255,255,0.06);border:1px solid var(--border);
    border-bottom-left-radius:4px;color:var(--text);
  }
  .msg-meta {
    font-size:10px;color:var(--muted);margin-top:4px;
    display:flex;align-items:center;gap:5px;
  }
  .me .msg-meta { justify-content:flex-end; }

  /* Date divider */
  .date-divider{
    display:flex;align-items:center;gap:10px;
    font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;
    margin:8px 0;
  }
  .date-divider .line{flex:1;height:1px;background:var(--border);}

  /* Empty state */
  .chat-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--muted);}
  .chat-empty .icon{font-size:36px;opacity:0.5;}
  .chat-empty p{font-size:13px;}

  /* Input bar */
  .input-bar {
    display:flex;align-items:center;gap:12px;
    padding:16px 20px;border-top:1px solid var(--border);
    position:relative;z-index:1;flex-shrink:0;
  }
  input.chat-input {
    flex:1;background:rgba(255,255,255,0.05);
    border:1px solid var(--border);border-radius:12px;
    padding:12px 16px;font-family:'DM Sans',sans-serif;font-size:14px;
    color:var(--text);outline:none;
    transition:border-color .2s,background .2s;
  }
  input.chat-input::placeholder{color:var(--muted);}
  input.chat-input:focus{border-color:rgba(79,255,176,0.35);background:rgba(79,255,176,0.04);}

  button.btn-send {
    width:44px;height:44px;border-radius:12px;flex-shrink:0;
    background:var(--accent);border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:transform .2s,box-shadow .2s,opacity .2s;
  }
  button.btn-send:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(79,255,176,0.3);}
  button.btn-send:active{transform:scale(0.95);}
  button.btn-send:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}
  button.btn-send svg{width:18px;height:18px;}

  /* Typing indicator */
  .typing{display:flex;align-items:center;gap:4px;padding:8px 12px;}
  .typing span{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:bounce .9s infinite;}
  .typing span:nth-child(2){animation-delay:.15s;}
  .typing span:nth-child(3){animation-delay:.3s;}
  @keyframes bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}
`;

const msgAnim = {
  hidden:{ opacity:0, y:10, scale:0.97 },
  show:{ opacity:1, y:0, scale:1, transition:{ duration:0.25, ease:[0.22,1,0.36,1] } },
  exit:{ opacity:0, scale:0.95, transition:{ duration:0.15 } },
};

const fadeUp = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };

function formatTime(dateStr) {
  try { return new Date(dateStr).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }); }
  catch { return ""; }
}

function initials(id) {
  if (!id) return "?";
  return id.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || id.slice(0, 2).toUpperCase();
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState("");
  const [loading,  setLoading]  = useState(true);
  const bottomRef = useRef(null);

  const senderId   = "user1";
  const receiverId = "doctor1";

  useEffect(() => {
    socket.emit("join", senderId);
    socket.on("receiveMessage", (data) => {
      setMessages(prev => [...prev, data]);
    });
    fetchHistory();
    return () => socket.off("receiveMessage");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${senderId}/${receiverId}`);
      const data = await res.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg = { senderId, receiverId, message: trimmed, createdAt: new Date().toISOString() };
    socket.emit("sendMessage", msg);
    setMessages(prev => [...prev, msg]);
    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> Secure Channel</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Chat</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>Real-time messaging with your care team.</motion.p>
        </motion.div>

        <motion.div
          className="chat-panel"
          initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, delay:0.2, ease:[0.22,1,0.36,1] }}
        >
          {/* Chat header */}
          <div className="chat-header">
            <div className="avatar">{initials(receiverId)}</div>
            <div className="chat-header-info">
              <div className="chat-header-name">{receiverId}</div>
              <div className="chat-header-status"><span className="online-dot" /> Online</div>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            {loading && (
              <div className="chat-empty">
                <div className="icon">💬</div>
                <p>Loading messages…</p>
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="chat-empty">
                <div className="icon">💬</div>
                <p>No messages yet. Say hello!</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => {
                const isMe = m.senderId === senderId;
                return (
                  <motion.div
                    key={i}
                    className={`msg-row ${isMe ? "me" : "them"}`}
                    variants={msgAnim}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                  >
                    <div className="bubble">{m.message}</div>
                    <div className="msg-meta">
                      {!isMe && <span>{m.senderId}</span>}
                      {m.createdAt && <span>{formatTime(m.createdAt)}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="input-bar">
            <input
              className="chat-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message… (Enter to send)"
            />
            <motion.button
              className="btn-send"
              onClick={sendMessage}
              disabled={!text.trim()}
              whileTap={{ scale:0.93 }}
            >
              <svg viewBox="0 0 18 18" fill="none">
                <path d="M2 9L16 2L9.5 16L8 10.5L2 9Z" fill="#06080f" stroke="#06080f" strokeWidth="0.5" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}