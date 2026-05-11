"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { bookAppointment, getSlots } from "@/services/appointmentService";
import { getDoctors } from "@/services/doctorService";
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
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => {
              setDate(e.target.value);
              setTime("");
              setError("");
              setMessage("");
            }}
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
          disabled={loading || !selectedDoctorId || !date || !time}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
