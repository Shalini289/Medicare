"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { bookAppointment, getSlots } from "@/services/appointmentService";
import { getDoctors } from "@/services/doctorService";
import { api } from "@/utils/api";

const toDateInputValue = (value = new Date()) => {
  const dateValue = new Date(value);
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toMinutes = (time = "00:00") => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
};

const getNowMinutes = (value = new Date()) => {
  const now = new Date(value);
  return now.getHours() * 60 + now.getMinutes();
};

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
  const params = useSearchParams();
  const doctorFromUrl = params.get("id");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [family, setFamily] = useState([]);
  const [selected, setSelected] = useState("self");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [clock, setClock] = useState(Date.now());
  const today = toDateInputValue();
  const currentMinutes = getNowMinutes(clock);
  const visibleSlots = availableSlots.filter((slot) => {
    if (!date || date > today) return true;
    if (date < today) return false;
    return toMinutes(slot) > currentMinutes;
  });

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
    const interval = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (date === today && time && toMinutes(time) <= currentMinutes) {
      setTime("");
      setError("This time slot has already passed. Please choose a later slot.");
    }
  }, [currentMinutes, date, time, today]);

  useEffect(() => {
    queueMicrotask(() => {
      getDoctors()
        .then((items) => {
          const list = Array.isArray(items) ? items : [];
          const initialDoctor = list.some((item) => item._id === doctorFromUrl)
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
  }, [doctorFromUrl]);

  useEffect(() => {
    if (!selectedDoctorId || !date) {
      setBookedSlots([]);
      return;
    }

    getSlots(selectedDoctorId, date)
      .then((slots) => setBookedSlots(Array.isArray(slots) ? slots : []))
      .catch(() => setBookedSlots([]));
  }, [date, selectedDoctorId]);

  const handle = async () => {
    setError("");
    setMessage("");

    if (!selectedDoctorId) {
      setError("Please select a doctor.");
      return;
    }

    if (!date || !time) {
      setError("Please choose a date and time slot.");
      return;
    }

    if (date < today) {
      setError("Please choose today or a future date.");
      return;
    }

    if (date === today && toMinutes(time) <= currentMinutes) {
      setError("This time slot has already passed. Please choose a later slot.");
      return;
    }

    try {
      setLoading(true);

      await bookAppointment({
        doctor: selectedDoctorId,
        date,
        time,
        patient: selected,
      });

      setMessage("Appointment booked successfully.");
      setTime("");
      const slots = await getSlots(selectedDoctorId, date);
      setBookedSlots(Array.isArray(slots) ? slots : []);
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-card glass">
        <h2>Book Appointment</h2>
        <p className="sub">Choose date, time, and patient</p>

        {error && <p className="booking-alert error">{error}</p>}
        {message && <p className="booking-alert success">{message}</p>}

        <div className="field">
          <label>Doctor</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => {
              setSelectedDoctorId(e.target.value);
              setTime("");
              setError("");
              setMessage("");
            }}
            disabled={loadingDoctors}
          >
            <option value="">{loadingDoctors ? "Loading doctors..." : "Choose doctor"}</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Date</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => {
              const nextDate = e.target.value;
              setDate(nextDate);
              setTime("");
              setError(nextDate && nextDate < today ? "Please choose today or a future date." : "");
              setMessage("");
            }}
          />
        </div>

        <div className="field">
          <label>Time Slot</label>
          <div className="slots">
            {visibleSlots.map((slot) => {
              const booked = bookedSlots.includes(slot);
              const unavailable = booked || date < today;

              return (
                <button
                  key={slot}
                  className={`slot ${time === slot ? "selected" : ""} ${unavailable ? "booked" : ""}`}
                  disabled={unavailable}
                  title={booked ? "Already booked" : "Available"}
                  onClick={() => {
                    setTime(slot);
                    setError("");
                    setMessage("");
                  }}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          {date === today && visibleSlots.length === 0 && (
            <p className="field-hint">
              No more appointment slots are available today. Please choose another date.
            </p>
          )}
        </div>

        <div className="field">
          <label>Select Patient</label>
          <select
            value={selected}
            onChange={(e)=>setSelected(e.target.value)}
          >
            <option value="self">Myself</option>

            {family.map(f => (
              <option key={f._id} value={f._id}>
                {f.name} ({f.relation})
              </option>
            ))}
          </select>
          {family.length === 0 && (
            <p className="field-hint">
              Add family members from Family Health to book for someone else.
            </p>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handle}
          disabled={loading || !selectedDoctorId || !date || date < today || !time}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
