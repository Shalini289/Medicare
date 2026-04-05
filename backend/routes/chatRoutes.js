"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const senderId = "user1";
  const receiverId = "doctor1";

  useEffect(() => {
    socket.emit("join", senderId);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    fetchHistory();

    return () => socket.off("receiveMessage");
  }, []);

  const fetchHistory = async () => {
    const res = await fetch(
      `http://localhost:5000/api/chat/${senderId}/${receiverId}`
    );
    const data = await res.json();
    setMessages(data.data);
  };

  const sendMessage = () => {
    const msg = { senderId, receiverId, message: text };

    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>💬 Chat</h1>

      <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "scroll" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.senderId}:</b> {m.message}
          </div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}