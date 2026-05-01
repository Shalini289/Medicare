"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getMessages, sendChatMessage } from "@/services/chatService";
import "@/styles/chat.css";

const getSenderId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).id;
  } catch {
    return null;
  }
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState(null);
  const socketRef = useRef(null);
  const bottomRef = useRef();

  useEffect(() => {
    queueMicrotask(() => {
      setSenderId(getSenderId());
      getMessages()
        .then((items) => setMessages(Array.isArray(items) ? items : []))
        .catch(() => setMessages([]));
    });
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendChatMessage(message);
      setMessage("");
    } catch {
      alert("Message failed");
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h3>Doctor Chat</h3>
        <span className="chat-status">Online</span>
      </div>

      <div className="chat-box">
        {messages.map((m, i) => {
          const mine = (m.sender?._id || m.sender) === senderId;

          return (
            <div
              key={m._id || i}
              className={`chat-msg ${mine ? "sent" : "received"}`}
            >
              <span>{m.sender?.name || (mine ? "You" : "Care Team")}</span>
              {m.message || m.text}
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
