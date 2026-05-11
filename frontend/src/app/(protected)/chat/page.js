"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getMessages, sendChatMessage } from "@/services/chatService";
import { getDoctors } from "@/services/doctorService";
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

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (apiUrl) return apiUrl;

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return null;
};

const getMessageDoctorId = (msg) => msg.doctor?._id || msg.doctor || null;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [senderId, setSenderId] = useState(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef();
  const selectedDoctorRef = useRef("");

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === selectedDoctorId),
    [doctors, selectedDoctorId]
  );

  useEffect(() => {
    selectedDoctorRef.current = selectedDoctorId;
  }, [selectedDoctorId]);

  useEffect(() => {
    queueMicrotask(() => {
      setSenderId(getSenderId());

      getDoctors()
        .then((items) => {
          const list = Array.isArray(items) ? items : [];
          const doctorFromUrl = new URLSearchParams(window.location.search).get("doctor");
          const initialDoctor = list.some((doctor) => doctor._id === doctorFromUrl)
            ? doctorFromUrl
            : list[0]?._id || "";

          setDoctors(list);
          setSelectedDoctorId(initialDoctor);
        })
        .catch(() => {
          setDoctors([]);
          setError("Doctors could not be loaded right now.");
        })
        .finally(() => setLoadingDoctors(false));
    });
  }, []);

  useEffect(() => {
    if (!selectedDoctorId) {
      return;
    }

    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      setLoadingMessages(true);
      setError("");

      getMessages(selectedDoctorId)
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
  }, [selectedDoctorId]);

  useEffect(() => {
    const socketUrl = getSocketUrl();

    if (!socketUrl) {
      return undefined;
    }

    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("receiveMessage", (msg) => {
      const activeDoctorId = selectedDoctorRef.current;

      if (!activeDoctorId || getMessageDoctorId(msg) !== activeDoctorId) {
        return;
      }

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
    if (!message.trim() || !selectedDoctorId) return;

    try {
      const sent = await sendChatMessage({
        message,
        doctor: selectedDoctorId,
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
          <h2>Messages</h2>
          <span>{doctors.length} doctors</span>
        </div>

        <div className="doctor-thread-list">
          {loadingDoctors ? (
            <p className="chat-empty">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p className="chat-empty">No doctors available.</p>
          ) : (
            doctors.map((doctor) => (
              <button
                type="button"
                key={doctor._id}
                className={`doctor-thread ${doctor._id === selectedDoctorId ? "active" : ""}`}
                onClick={() => setSelectedDoctorId(doctor._id)}
              >
                <span>{doctor.name}</span>
                <small>{doctor.specialization}</small>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="chat-panel">
        <div className="chat-header">
          <div>
            <h3>{selectedDoctor?.name || "Select a doctor"}</h3>
            <p>{selectedDoctor?.hospital || selectedDoctor?.specialization || "Choose a doctor to start chatting"}</p>
          </div>
          <span className="chat-status">{selectedDoctor ? "Doctor thread" : "Waiting"}</span>
        </div>

        {error && <div className="chat-error">{error}</div>}

        <div className="chat-box">
          {loadingMessages ? (
            <p className="chat-empty">Loading conversation...</p>
          ) : messages.length === 0 ? (
            <p className="chat-empty">
              {selectedDoctor
                ? `No messages with ${selectedDoctor.name} yet.`
                : "Select a doctor to view messages."}
            </p>
          ) : (
            messages.map((m, i) => {
              const mine = (m.sender?._id || m.sender) === senderId;

              return (
                <div
                  key={m._id || i}
                  className={`chat-msg ${mine ? "sent" : "received"}`}
                >
                  <span>{mine ? "You" : m.sender?.name || selectedDoctor?.name || "Doctor"}</span>
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
            placeholder={selectedDoctor ? `Message ${selectedDoctor.name}` : "Select a doctor first"}
            disabled={!selectedDoctor}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button disabled={!selectedDoctor || !message.trim()} onClick={sendMessage}>
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
