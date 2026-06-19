"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { io } from "socket.io-client";
import { getApiUrl } from "@/utils/runtimeConfig";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);

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

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event) => {
      if (!bellRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const clearAll = () => setNotifications([]);

  return (
    <div className="notif-bell" ref={bellRef}>
      <button
        className="bell-icon"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <FaBell aria-hidden="true" />
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
