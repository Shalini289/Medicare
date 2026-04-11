"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // 📡 Socket
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("slotBooked", () => {
      add("📅 New appointment booked");
    });

    socket.on("bedUpdate", () => {
      add("🏥 Hospital bed updated");
    });

    socket.on("receiveMessage", () => {
      add("💬 New message received");
    });

    return () => socket.disconnect();
  }, []);

  // ➕ Add notification
  const add = (text) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        text,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  // 🗑 Clear
  const clearAll = () => setNotifications([]);

  return (
    <div className="notif-bell">

      {/* ICON */}
      <div
        className="bell-icon"
        onClick={() => setOpen(!open)}
      >
        🔔

        {notifications.length > 0 && (
          <span className="badge">
            {notifications.length}
          </span>
        )}
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="notif-dropdown">

          <div className="notif-header">
            <h4>Notifications</h4>
            <button onClick={clearAll}>Clear</button>
          </div>

          {notifications.length === 0 && (
            <p className="empty">No notifications</p>
          )}

          {notifications.map((n) => (
            <div key={n.id} className="notif-item">
              <p>{n.text}</p>
              <span>{n.time}</span>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}