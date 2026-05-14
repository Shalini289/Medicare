"use client";

import "@/styles/notification.css";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from "@/services/notificationService";
import { getApiUrl } from "@/utils/runtimeConfig";

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
    const socketUrl = getApiUrl();

    if (!socketUrl) return undefined;

    const socket = io(socketUrl);

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

  const removeNotification = async (event, id) => {
    event.stopPropagation();

    if (!String(id).startsWith("bed-")) {
      await deleteNotification(id);
    }

    setNotifications((prev) => prev.filter((n) => n._id !== id));
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
            <div className="notif-card-head">
              <strong>{n.title || "Notification"}</strong>
              <button
                type="button"
                className="notif-delete-btn"
                onClick={(event) => removeNotification(event, n._id)}
                aria-label={`Delete ${n.title || "notification"}`}
              >
                Delete
              </button>
            </div>
            <p>{n.message}</p>
            <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
