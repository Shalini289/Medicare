"use client";

import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getApiUrl } from "@/utils/runtimeConfig";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const add = useCallback((text) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        text,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    const socket = io(apiUrl);

    socket.on("slotBooked", () => {
      add("New appointment booked");
    });

    socket.on("bedUpdate", () => {
      add("Hospital bed availability updated");
    });

    socket.on("receiveMessage", () => {
      add("New message received");
    });

    return () => socket.disconnect();
  }, [add]);

  const clearAll = () => setNotifications([]);

  return (
    <div className="notif-bell">
      <button
        className="bell-icon"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        N
        {notifications.length > 0 && (
          <span className="badge">
            {notifications.length}
          </span>
        )}
      </button>

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
