"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { bookAppointment, getSlots } from "@/services/appointmentService";
import { api } from "@/utils/api";

const availableSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

export default function Booking() {
  const doctor = useSearchParams().get("id");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [family, setFamily] = useState([]);
  const [selected, setSelected] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFamily = useCallback(async () => {
    const res = await api("/api/family");
    setFamily(Array.isArray(res) ? res : []);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadFamily();
    });
  }, [loadFamily]);

  useEffect(() => {
    if (!doctor || !date) {
      setBookedSlots([]);
      return;
    }

    getSlots(doctor, date)
      .then((slots) => setBookedSlots(Array.isArray(slots) ? slots : []))
      .catch(() => setBookedSlots([]));
  }, [date, doctor]);

  const handle = async () => {
    if (!date || !time || !selected) {
      return alert("Please fill all fields");
    }

    try {
      setLoading(true);

      await bookAppointment({
        doctor,
        date,
        time,
        patient: selected,
      });

      alert("Appointment booked successfully");
    } catch {
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-card glass">
        <h2>Book Appointment</h2>
        <p className="sub">Choose date, time, and patient</p>

        <div className="field">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e)=>setDate(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Time Slot</label>
          <div className="slots">
            {availableSlots.map((slot) => {
              const booked = bookedSlots.includes(slot);

              return (
                <button
                  key={slot}
                  className={`slot ${time === slot ? "selected" : ""} ${booked ? "booked" : ""}`}
                  disabled={booked}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label>Select Patient</label>
          <select
            value={selected}
            onChange={(e)=>setSelected(e.target.value)}
          >
            <option value="">Choose patient</option>

            {family.map(f => (
              <option key={f._id} value={f._id}>
                {f.name} ({f.relation})
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={handle}
          disabled={loading}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
