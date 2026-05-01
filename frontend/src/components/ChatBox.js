"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatBox() {
  const [msg, setMsg] = useState("");
  const [list, setList] = useState([]);

  const bottomRef = useRef();

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list]);

  const send = () => {
    if (!msg.trim()) return;

    setList(prev => [
      ...prev,
      { text: msg, type: "sent" }
    ]);

    setMsg("");
  };

  return (
    <div className="chatbox">

      {/* MESSAGES */}
      <div className="chatbox-messages">
        {list.map((m, i) => (
          <div
            key={i}
            className={`chatbox-msg ${m.type}`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="chatbox-input">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === "Enter" && send()}
        />

        <button onClick={send}>Send</button>
      </div>

    </div>
  );
}
