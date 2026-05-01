"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointment, getMyAppointments } from "@/services/appointmentService";
import AppointmentCard from "@/components/AppointmentCard";
import "@/styles/appointment.css";

export default function Profile() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    try {
      const res = await getMyAppointments();
      setAppointments(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadAppointments();
    });
  }, [loadAppointments]);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus = status === "all" || appointment.status === status;
      const doctorText = [
        appointment.doctor?.name,
        appointment.doctor?.specialization,
        appointment.date,
        appointment.time,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!query || doctorText.includes(query));
    });
  }, [appointments, search, status]);

  const counts = useMemo(() => {
    return appointments.reduce(
      (summary, appointment) => {
        const key = appointment.status || "booked";
        return {
          ...summary,
          all: summary.all + 1,
          [key]: (summary[key] || 0) + 1,
        };
      },
      { all: 0, booked: 0, cancelled: 0, completed: 0 }
    );
  }, [appointments]);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;

    await cancelAppointment(id);
    setAppointments(prev =>
      prev.map(item =>
        item._id === id ? { ...item, status: "cancelled" } : item
      )
    );
  };

  const handleRebook = (appointment) => {
    router.push(`/booking?id=${appointment.doctor?._id || appointment.doctor}`);
  };

  if (loading) return <p className="center">Loading appointments...</p>;

  return (
    <div className="profile-page">
      <div className="appointment-header">
        <div>
          <h1>My Appointments</h1>
          <p>Track, filter, cancel, or rebook your consultations.</p>
        </div>
      </div>

      <div className="appointment-summary">
        <button onClick={() => setStatus("all")}>All {counts.all}</button>
        <button onClick={() => setStatus("booked")}>Booked {counts.booked}</button>
        <button onClick={() => setStatus("cancelled")}>Cancelled {counts.cancelled}</button>
        <button onClick={() => setStatus("completed")}>Completed {counts.completed}</button>
      </div>

      <div className="appointment-tools">
        <input
          type="search"
          placeholder="Search doctor, speciality, date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredAppointments.length === 0 && <p>No appointments found</p>}

      <div className="appointments-grid">
        {filteredAppointments.map(a => (
          <AppointmentCard
            key={a._id}
            item={a}
            onCancel={handleCancel}
            onRebook={handleRebook}
          />
        ))}
      </div>
    </div>
  );
}
