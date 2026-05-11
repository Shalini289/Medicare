"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getChatThreads, getMessages, sendChatMessage } from "@/services/chatService";
import { getCurrentUser } from "@/utils/auth";
import "@/styles/chat.css";

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (apiUrl) return apiUrl;

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return null;
};

const getMessageDoctorId = (msg) => msg.doctor?._id || msg.doctor || null;
const getMessageParticipantId = (msg, currentUserId) => {
  const senderId = msg.sender?._id || msg.sender;
  const receiverId = msg.receiver?._id || msg.receiver;

  return senderId === currentUserId ? receiverId : senderId;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef();
  const selectedThreadRef = useRef("");
  const currentUserRef = useRef(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread._id === selectedThreadId),
    [threads, selectedThreadId]
  );

  const isDoctor = currentUser?.role === "doctor";

  useEffect(() => {
    selectedThreadRef.current = selectedThreadId;
  }, [selectedThreadId]);

  useEffect(() => {
    queueMicrotask(() => {
      const user = getCurrentUser();
      setCurrentUser(user);
      currentUserRef.current = user;

      getChatThreads()
        .then((items) => {
          const list = Array.isArray(items) ? items : [];
          const threadFromUrl = new URLSearchParams(window.location.search).get(user?.role === "doctor" ? "patient" : "doctor");
          const initialThread = list.some((thread) => thread._id === threadFromUrl)
            ? threadFromUrl
            : list[0]?._id || "";

          setThreads(list);
          setSelectedThreadId(initialThread);
        })
        .catch(() => {
          setThreads([]);
          setError("Conversations could not be loaded right now.");
        })
        .finally(() => setLoadingThreads(false));
    });
  }, []);

  useEffect(() => {
    if (!selectedThreadId || !currentUser) {
      return;
    }

    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      setLoadingMessages(true);
      setError("");

      getMessages(isDoctor ? { patient: selectedThreadId } : { doctor: selectedThreadId })
        .then((items) => {
          if (active) {
            setMessages(Array.isArray(items) ? items : []);
          }
        })
        .catch(() => {
          if (active) {
            setMessages([]);
            setError("Messages could not be loaded right now.");
          }
        })
        .finally(() => {
          if (active) {
            setLoadingMessages(false);
          }
        });
    });

    return () => {
      active = false;
    };
  }, [currentUser, isDoctor, selectedThreadId]);

  useEffect(() => {
    const socketUrl = getSocketUrl();

    if (!socketUrl) {
      return undefined;
    }

    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("receiveMessage", (msg) => {
      const user = currentUserRef.current;
      const activeThreadId = selectedThreadRef.current;

      if (!user || !activeThreadId) {
        return;
      }

      const belongsToThread = user.role === "doctor"
        ? getMessageParticipantId(msg, user.id) === activeThreadId
        : getMessageDoctorId(msg) === activeThreadId;

      if (!belongsToThread) return;

      setMessages((prev) => {
        if (msg._id && prev.some((item) => item._id === msg._id)) {
          return prev;
        }

        return [...prev, msg];
      });
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
    if (!message.trim() || !selectedThreadId) return;

    try {
      const sent = await sendChatMessage({
        message,
        ...(isDoctor ? { receiver: selectedThreadId } : { doctor: selectedThreadId }),
      });

      setMessages((prev) => {
        if (sent._id && prev.some((item) => item._id === sent._id)) {
          return prev;
        }

        return [...prev, sent];
      });
      setMessage("");
    } catch (err) {
      setError(err.message || "Message failed");
    }
  };

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-head">
          <h2>{isDoctor ? "Patient Messages" : "Messages"}</h2>
          <span>{threads.length} {isDoctor ? "patients" : "doctors"}</span>
        </div>

        <div className="doctor-thread-list">
          {loadingThreads ? (
            <p className="chat-empty">Loading conversations...</p>
          ) : threads.length === 0 ? (
            <p className="chat-empty">{isDoctor ? "No patient conversations yet." : "No doctors available."}</p>
          ) : (
            threads.map((thread) => (
              <button
                type="button"
                key={thread._id}
                className={`doctor-thread ${thread._id === selectedThreadId ? "active" : ""}`}
                onClick={() => setSelectedThreadId(thread._id)}
              >
                <span>{thread.name}</span>
                <small>{thread.subtitle}</small>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="chat-panel">
        <div className="chat-header">
          <div>
            <h3>{selectedThread?.name || (isDoctor ? "Select a patient" : "Select a doctor")}</h3>
            <p>{selectedThread?.subtitle || (isDoctor ? "Choose a patient to reply" : "Choose a doctor to start chatting")}</p>
          </div>
          <span className="chat-status">{selectedThread ? (isDoctor ? "Patient thread" : "Doctor thread") : "Waiting"}</span>
        </div>

        {error && <div className="chat-error">{error}</div>}

        <div className="chat-box">
          {loadingMessages ? (
            <p className="chat-empty">Loading conversation...</p>
          ) : messages.length === 0 ? (
            <p className="chat-empty">
              {selectedThread
                ? `No messages with ${selectedThread.name} yet.`
                : `Select a ${isDoctor ? "patient" : "doctor"} to view messages.`}
            </p>
          ) : (
            messages.map((m, i) => {
              const mine = (m.sender?._id || m.sender) === currentUser?.id;

              return (
                <div
                  key={m._id || i}
                  className={`chat-msg ${mine ? "sent" : "received"}`}
                >
                  <span>{mine ? "You" : m.sender?.name || selectedThread?.name || (isDoctor ? "Patient" : "Doctor")}</span>
                  <p>{m.message || m.text}</p>
                </div>
              );
            })
          )}
          <div ref={bottomRef}></div>
        </div>

        <div className="chat-input">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={selectedThread ? `Message ${selectedThread.name}` : `Select a ${isDoctor ? "patient" : "doctor"} first`}
            disabled={!selectedThread}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button disabled={!selectedThread || !message.trim()} onClick={sendMessage}>
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
