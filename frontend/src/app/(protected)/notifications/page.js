"use client";

import "@/styles/notification.css";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  clearNotifications,
  getNotifications,
  markNotificationRead,
} from "@/services/notificationService";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    const items = await getNotifications();
    setNotifications(Array.isArray(items) ? items : []);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadNotifications().catch(() => setNotifications([]));
    });
  }, [loadNotifications]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on("bedUpdate", () => {
      setNotifications((prev) => [
        {
          _id: `bed-${Date.now()}`,
          title: "Hospital beds updated",
          message: "Hospital bed availability changed",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => socket.disconnect();
  }, []);

  const markRead = async (id) => {
    if (!String(id).startsWith("bed-")) {
      await markNotificationRead(id);
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, read: true } : n
      )
    );
  };

  const clearAll = async () => {
    await clearNotifications();
    setNotifications([]);
  };

  return (
    <div className="notif-page">
      <div className="notif-header">
        <h1>Notifications</h1>
        <button onClick={clearAll} className="clear-btn">
          Clear All
        </button>
      </div>

      {notifications.length === 0 && (
        <p className="notif-empty">No notifications yet</p>
      )}

      <div className="notif-list">
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`notif-card ${n.read ? "read" : ""}`}
            onClick={() => markRead(n._id)}
          >
            <strong>{n.title || "Notification"}</strong>
            <p>{n.message}</p>
            <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
