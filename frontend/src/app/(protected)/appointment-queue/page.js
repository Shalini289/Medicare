"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { FaBell, FaClock, FaHospitalUser, FaTicketAlt } from "react-icons/fa";
import { getAppointmentQueue, getMyAppointmentQueues } from "@/services/appointmentService";
import { getDoctors } from "@/services/doctorService";
import { getApiUrl } from "@/utils/runtimeConfig";
import "@/styles/appointmentQueue.css";

const today = () => new Date().toISOString().slice(0, 10);

const formatWait = (minutes = 0) => {
  const value = Number(minutes || 0);
  if (value <= 0) return "Now";
  if (value < 60) return `${value} min`;
  return `${Math.floor(value / 60)}h ${value % 60}m`;
};

export default function AppointmentQueuePage() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(today());
  const [queueData, setQueueData] = useState(null);
  const [myQueues, setMyQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQueue = useCallback(async (nextDoctorId = doctorId, nextDate = date) => {
    if (!nextDoctorId || !nextDate) return;

    try {
      setError("");
      const data = await getAppointmentQueue(nextDoctorId, nextDate);
      setQueueData(data);
    } catch (err) {
      setQueueData(null);
      setError(err.message || "Could not load queue");
    }
  }, [date, doctorId]);

  const loadInitial = useCallback(async () => {
    setLoading(true);

    try {
      const [doctorList, ownQueues] = await Promise.all([
        getDoctors(),
        getMyAppointmentQueues(),
      ]);
      const list = Array.isArray(doctorList) ? doctorList : [];
      const queues = Array.isArray(ownQueues) ? ownQueues : [];
      const firstDoctor = queues[0]?.doctor?._id || list[0]?._id || "";
      const firstDate = queues[0]?.date || today();

      setDoctors(list);
      setMyQueues(queues);
      setDoctorId(firstDoctor);
      setDate(firstDate);

      if (firstDoctor) {
        const data = await getAppointmentQueue(firstDoctor, firstDate);
        setQueueData(data);
      }
    } catch (err) {
      setError(err.message || "Could not load appointment queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadInitial();
    });
  }, [loadInitial]);

  useEffect(() => {
    const socketUrl = getApiUrl();
    if (!socketUrl || !doctorId) return undefined;

    const socket = io(socketUrl);

    socket.on("appointmentQueueUpdated", (payload) => {
      if (payload?.doctor === doctorId && payload?.date === date) {
        loadQueue(doctorId, date);
      }
    });

    return () => socket.disconnect();
  }, [date, doctorId, loadQueue]);

  const myToken = useMemo(() => {
    return queueData?.queue?.find((item) => item.isMine && item.status === "booked") || null;
  }, [queueData]);

  const handleDoctorChange = (value) => {
    setDoctorId(value);
    loadQueue(value, date);
  };

  const handleDateChange = (value) => {
    setDate(value);
    loadQueue(doctorId, value);
  };

  if (loading) return <p className="center">Loading appointment queue...</p>;

  return (
    <main className="queue-page">
      <section className="queue-hero">
        <div>
          <span className="eyebrow">Live clinic queue</span>
          <h1>Smart Appointment Queue</h1>
          <p>Track token movement, wait time, and consultation delays in real time.</p>
        </div>
        <button className="btn-primary" onClick={() => loadQueue()}>
          Refresh Queue
        </button>
      </section>

      {error && <p className="queue-alert">{error}</p>}

      <section className="queue-controls">
        <label>
          Doctor
          <select value={doctorId} onChange={(event) => handleDoctorChange(event.target.value)}>
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input type="date" value={date} min={today()} onChange={(event) => handleDateChange(event.target.value)} />
        </label>
      </section>

      {myQueues.length > 0 && (
        <section className="my-queues">
          <h2>My active queues</h2>
          <div>
            {myQueues.map((item) => {
              const token = item.queue.find((entry) => entry.isMine);
              return (
                <button
                  key={`${item.doctor?._id}-${item.date}`}
                  onClick={() => {
                    setDoctorId(item.doctor._id);
                    setDate(item.date);
                    setQueueData(item);
                  }}
                >
                  <strong>{item.doctor?.name || "Doctor"}</strong>
                  <span>Token {token?.tokenNumber || "--"} | {item.date}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {queueData && (
        <>
          <section className="queue-stats">
            <div>
              <FaTicketAlt aria-hidden="true" />
              <span>Current token</span>
              <strong>{queueData.stats.currentToken || "None"}</strong>
            </div>
            <div>
              <FaHospitalUser aria-hidden="true" />
              <span>Waiting</span>
              <strong>{queueData.stats.waiting}</strong>
            </div>
            <div>
              <FaClock aria-hidden="true" />
              <span>Predicted delay</span>
              <strong>{formatWait(queueData.stats.predictedDelayMinutes)}</strong>
            </div>
            <div>
              <FaBell aria-hidden="true" />
              <span>Your wait</span>
              <strong>{myToken ? formatWait(myToken.estimatedWaitMinutes) : "No token"}</strong>
            </div>
          </section>

          {myToken && (
            <section className="queue-my-token">
              <div>
                <span>Your token</span>
                <strong>#{myToken.tokenNumber}</strong>
              </div>
              <p>
                You are {myToken.queuePosition === 1 ? "next in queue" : `number ${myToken.queuePosition} in waiting queue`}.
                Estimated wait: {formatWait(myToken.estimatedWaitMinutes)}.
              </p>
            </section>
          )}

          <section className="queue-board">
            <div className="queue-board__head">
              <div>
                <h2>{queueData.doctor?.name}</h2>
                <p>{queueData.doctor?.specialization} | {queueData.date}</p>
              </div>
              <span>{queueData.stats.totalTokens} tokens</span>
            </div>

            {queueData.queue.length === 0 && <p className="empty-state">No active tokens for this doctor and date.</p>}

            {queueData.queue.map((item) => (
              <article className={`queue-token ${item.isMine ? "is-mine" : ""}`} key={item._id}>
                <div className="queue-token__number">#{item.tokenNumber}</div>
                <div>
                  <h3>{item.isMine ? "Your appointment" : item.patient?.name || "Patient"}</h3>
                  <p>{item.time} | {item.status.replace(/-/g, " ")}</p>
                </div>
                <div>
                  <span>{item.status === "booked" ? `Wait ${formatWait(item.estimatedWaitMinutes)}` : "Done"}</span>
                  {item.queuePosition > 0 && <strong>Position {item.queuePosition}</strong>}
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
