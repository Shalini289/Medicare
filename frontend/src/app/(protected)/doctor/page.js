"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCalendarAlt, FaFilePrescription, FaMicrophone, FaSave, FaTrash, FaUserInjured, FaVideo } from "react-icons/fa";
import { getDoctors, getMyDoctorProfile } from "@/services/doctorService";
import {
  createDoctorNote,
  createDoctorPrescription,
  getDoctorDiagnosisSuggestions,
  getDoctorNotes,
  getDoctorPortalDashboard,
  scheduleDoctorAppointment,
  updateDoctorAppointmentStatus,
  updateDoctorAvailability,
} from "@/services/doctorPortalService";
import "@/styles/doctorPortal.css";

const blankMedicine = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const blankSchedule = {
  patientId: "",
  date: new Date().toISOString().slice(0, 10),
  time: "10:00",
};

const blankPrescription = {
  patientId: "",
  diagnosis: "",
  validUntil: "",
  followUpDate: "",
  patientInstructions: "",
  digitalSignature: "",
  notes: "",
  medicines: [{ ...blankMedicine }],
};

const blankNote = {
  patientId: "",
  title: "",
  transcript: "",
  summary: "",
  plan: "",
};

const defaultAvailability = [
  { day: "Monday", startTime: "09:00", endTime: "13:00", mode: "both" },
  { day: "Wednesday", startTime: "14:00", endTime: "18:00", mode: "video" },
];

const SpeechRecognition =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function DoctorPortalPage() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [notes, setNotes] = useState([]);
  const [scheduleForm, setScheduleForm] = useState(blankSchedule);
  const [prescriptionForm, setPrescriptionForm] = useState(blankPrescription);
  const [noteForm, setNoteForm] = useState(blankNote);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [availableToday, setAvailableToday] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const patients = useMemo(() => dashboard?.patients || [], [dashboard]);
  const appointments = useMemo(() => dashboard?.appointments || [], [dashboard]);
  const doctor = dashboard?.doctor;

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient._id === (noteForm.patientId || prescriptionForm.patientId || scheduleForm.patientId)),
    [noteForm.patientId, patients, prescriptionForm.patientId, scheduleForm.patientId]
  );

  const loadDashboard = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const data = await getDoctorPortalDashboard(id);
      setDashboard(data);
      setAvailability(data.doctor?.availabilitySchedule?.length ? data.doctor.availabilitySchedule : defaultAvailability);
      setAvailableToday(Boolean(data.doctor?.availableToday));
      const firstPatient = data.patients?.[0]?._id || "";
      setScheduleForm((current) => ({ ...current, patientId: current.patientId || firstPatient }));
      setPrescriptionForm((current) => ({ ...current, patientId: current.patientId || firstPatient }));
      setNoteForm((current) => ({ ...current, patientId: current.patientId || firstPatient }));
      const noteData = await getDoctorNotes(id);
      setNotes(Array.isArray(noteData) ? noteData : []);
    } catch (err) {
      setError(err.message || "Could not load doctor portal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      getDoctors()
        .then(async (items) => {
          const list = Array.isArray(items) ? items : [];
          setDoctors(list);
          let initialDoctor = list[0]?._id || "";

          try {
            const ownDoctor = await getMyDoctorProfile();
            initialDoctor = ownDoctor?._id || initialDoctor;
          } catch {
            initialDoctor = list[0]?._id || "";
          }

          setDoctorId(initialDoctor);
          return loadDashboard(initialDoctor);
        })
        .catch((err) => {
          setError(err.message || "Could not load doctors");
          setLoading(false);
        });
    });
  }, [loadDashboard]);

  useEffect(() => {
    if (!doctorId) return;

    queueMicrotask(() => {
      loadDashboard(doctorId);
    });
  }, [doctorId, loadDashboard]);

  const patientOptions = patients.length ? patients : [{ _id: "", name: "No patients yet" }];

  const changeMedicine = (index, field, value) => {
    setPrescriptionForm((current) => ({
      ...current,
      medicines: current.medicines.map((medicine, itemIndex) =>
        itemIndex === index ? { ...medicine, [field]: value } : medicine
      ),
    }));
  };

  const addMedicine = () => {
    setPrescriptionForm((current) => ({
      ...current,
      medicines: [...current.medicines, { ...blankMedicine }],
    }));
  };

  const removeMedicine = (index) => {
    setPrescriptionForm((current) => ({
      ...current,
      medicines: current.medicines.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const savePrescription = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    try {
      await createDoctorPrescription(doctorId, {
        ...prescriptionForm,
        doctorName: doctor?.name,
        digitalSignature: prescriptionForm.digitalSignature || doctor?.name,
      });
      setStatus("Digital prescription created for patient.");
      setPrescriptionForm((current) => ({ ...blankPrescription, patientId: current.patientId }));
      await loadDashboard(doctorId);
    } catch (err) {
      setError(err.message || "Could not create prescription");
    }
  };

  const saveAppointment = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    try {
      await scheduleDoctorAppointment(doctorId, scheduleForm);
      setStatus("Appointment scheduled.");
      await loadDashboard(doctorId);
    } catch (err) {
      setError(err.message || "Could not schedule appointment");
    }
  };

  const saveNote = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    try {
      await createDoctorNote(doctorId, {
        ...noteForm,
        type: "voice-note",
        diagnosisSuggestions: aiResult?.suggestions || [],
      });
      setStatus("Medical note saved.");
      setNoteForm((current) => ({ ...blankNote, patientId: current.patientId }));
      const noteData = await getDoctorNotes(doctorId);
      setNotes(Array.isArray(noteData) ? noteData : []);
    } catch (err) {
      setError(err.message || "Could not save note");
    }
  };

  const askAI = async () => {
    if (!aiInput.trim()) return;
    setError("");
    setStatus("");

    try {
      const result = await getDoctorDiagnosisSuggestions(doctorId, { symptoms: aiInput });
      setAiResult(result);
      setNoteForm((current) => ({
        ...current,
        summary: current.summary || aiInput.slice(0, 180),
        plan: result.carePlan?.join("\n") || current.plan,
      }));
    } catch (err) {
      setError(err.message || "Could not get AI suggestions");
    }
  };

  const startVoiceNote = () => {
    if (!SpeechRecognition) {
      setError("Voice-to-text is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      setNoteForm((current) => ({ ...current, transcript: text }));
    };

    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  const stopVoiceNote = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const changeAvailability = (index, field, value) => {
    setAvailability((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addAvailabilityRow = () => {
    setAvailability((current) => [...current, { day: "Friday", startTime: "09:00", endTime: "12:00", mode: "both" }]);
  };

  const saveAvailability = async () => {
    setError("");
    setStatus("");

    try {
      await updateDoctorAvailability(doctorId, {
        availableToday,
        availability: availability.map((item) => `${item.day} ${item.startTime}-${item.endTime}`).join(", "),
        availabilitySchedule: availability,
      });
      setStatus("Availability updated.");
      await loadDashboard(doctorId);
    } catch (err) {
      setError(err.message || "Could not update availability");
    }
  };

  return (
    <main className="doctor-portal-page">
      <section className="doctor-portal-hero">
        <div>
          <span className="eyebrow">Doctor features</span>
          <h1>Doctor Portal</h1>
          <p>Manage patients, visits, prescriptions, schedules, notes, AI suggestions, and availability from one clinical workspace.</p>
        </div>

        <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
          {doctors.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name} - {item.specialization}
            </option>
          ))}
        </select>

        <a className="doctor-video-link" href={`/video-call?doctor=${doctorId}&role=doctor`} aria-disabled={!doctorId}>
          <FaVideo aria-hidden="true" />
          Join video room
        </a>
      </section>

      {error && <p className="doctor-alert error">{error}</p>}
      {status && <p className="doctor-alert success">{status}</p>}
      {loading && <p className="doctor-alert">Loading doctor portal...</p>}

      <section className="doctor-stat-grid">
        <div><strong>{dashboard?.stats?.todayAppointments || 0}</strong><span>Today</span></div>
        <div><strong>{dashboard?.stats?.appointments || 0}</strong><span>Appointments</span></div>
        <div><strong>{dashboard?.stats?.patients || 0}</strong><span>Patients</span></div>
        <div><strong>{dashboard?.stats?.completed || 0}</strong><span>Completed</span></div>
      </section>

      <section className="doctor-section">
        <div className="section-title">
          <FaUserInjured aria-hidden="true" />
          <h2>Patient management</h2>
        </div>

        <div className="patient-grid">
          {patients.length === 0 ? (
            <p className="empty-state">No patients yet. Schedule an appointment to start managing patients.</p>
          ) : patients.map((patient) => (
            <article className="patient-card" key={patient._id}>
              <h3>{patient.name}</h3>
              <p>{patient.email || patient.phone || "No contact saved"}</p>
              <dl>
                <div><dt>Appointments</dt><dd>{patient.appointmentCount}</dd></div>
                <div><dt>Prescriptions</dt><dd>{patient.prescriptions}</dd></div>
                <div><dt>Notes</dt><dd>{patient.notes}</dd></div>
              </dl>
              <p>{patient.conditions?.length ? `Conditions: ${patient.conditions.join(", ")}` : "No conditions recorded"}</p>
              <p>{patient.allergies?.length ? `Allergies: ${patient.allergies.join(", ")}` : "No allergies recorded"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="doctor-two-col">
        <form className="doctor-section" onSubmit={saveAppointment}>
          <div className="section-title">
            <FaCalendarAlt aria-hidden="true" />
            <h2>Appointment scheduling</h2>
          </div>

          <label>
            Patient
            <select
              value={scheduleForm.patientId}
              onChange={(event) => setScheduleForm((current) => ({ ...current, patientId: event.target.value }))}
            >
              {patientOptions.map((patient) => (
                <option key={patient._id || "none"} value={patient._id}>{patient.name}</option>
              ))}
            </select>
          </label>

          <div className="doctor-form-grid">
            <label>
              Date
              <input
                type="date"
                value={scheduleForm.date}
                onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
            <label>
              Time
              <input
                type="time"
                value={scheduleForm.time}
                onChange={(event) => setScheduleForm((current) => ({ ...current, time: event.target.value }))}
              />
            </label>
          </div>

          <button className="btn-primary" type="submit" disabled={!scheduleForm.patientId}>Schedule appointment</button>
        </form>

        <div className="doctor-section">
          <div className="section-title">
            <FaCalendarAlt aria-hidden="true" />
            <h2>Appointments</h2>
          </div>

          <div className="appointment-list">
            {appointments.slice(0, 6).map((item) => (
              <article key={item._id}>
                <div>
                  <strong>{item.user?.name || "Patient"}</strong>
                  <span>{item.date} at {item.time}</span>
                </div>
                <select
                  value={item.status}
                  onChange={(event) => updateDoctorAppointmentStatus(doctorId, item._id, event.target.value).then(() => loadDashboard(doctorId))}
                >
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="doctor-two-col">
        <form className="doctor-section" onSubmit={savePrescription}>
          <div className="section-title">
            <FaFilePrescription aria-hidden="true" />
            <h2>E-prescription generator</h2>
          </div>

          <label>
            Patient
            <select
              value={prescriptionForm.patientId}
              onChange={(event) => setPrescriptionForm((current) => ({ ...current, patientId: event.target.value }))}
            >
              {patientOptions.map((patient) => (
                <option key={patient._id || "none"} value={patient._id}>{patient.name}</option>
              ))}
            </select>
          </label>

          <label>
            Diagnosis
            <input
              value={prescriptionForm.diagnosis}
              onChange={(event) => setPrescriptionForm((current) => ({ ...current, diagnosis: event.target.value }))}
              placeholder="Diagnosis"
            />
          </label>

          <div className="medicine-stack">
            {prescriptionForm.medicines.map((medicine, index) => (
              <div className="medicine-row" key={index}>
                <label>
                  Medicine
                  <input value={medicine.name} onChange={(event) => changeMedicine(index, "name", event.target.value)} placeholder="Medicine name" />
                </label>
                <label>
                  Dose
                  <input value={medicine.dosage} onChange={(event) => changeMedicine(index, "dosage", event.target.value)} placeholder="500mg" />
                </label>
                <label>
                  Frequency
                  <input value={medicine.frequency} onChange={(event) => changeMedicine(index, "frequency", event.target.value)} placeholder="Daily" />
                </label>
                <label>
                  Duration
                  <input value={medicine.duration} onChange={(event) => changeMedicine(index, "duration", event.target.value)} placeholder="5 days" />
                </label>
                <label className="medicine-instructions">
                  Instructions
                  <input value={medicine.instructions} onChange={(event) => changeMedicine(index, "instructions", event.target.value)} placeholder="After meals" />
                </label>
                <button
                  className="medicine-remove"
                  type="button"
                  onClick={() => removeMedicine(index)}
                  disabled={prescriptionForm.medicines.length === 1}
                  title={prescriptionForm.medicines.length === 1 ? "At least one medicine is required" : "Remove medicine"}
                >
                  <FaTrash aria-hidden="true" />
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="btn-secondary" onClick={addMedicine}>Add medicine</button>

          <label>
            Patient instructions
            <textarea
              rows="3"
              value={prescriptionForm.patientInstructions}
              onChange={(event) => setPrescriptionForm((current) => ({ ...current, patientInstructions: event.target.value }))}
              placeholder="Instructions for patient"
            />
          </label>

          <button className="btn-primary" type="submit" disabled={!prescriptionForm.patientId}>Create digital prescription</button>
        </form>

        <form className="doctor-section" onSubmit={saveNote}>
          <div className="section-title">
            <FaMicrophone aria-hidden="true" />
            <h2>Voice-to-text medical notes</h2>
          </div>

          <label>
            Patient
            <select
              value={noteForm.patientId}
              onChange={(event) => setNoteForm((current) => ({ ...current, patientId: event.target.value }))}
            >
              {patientOptions.map((patient) => (
                <option key={patient._id || "none"} value={patient._id}>{patient.name}</option>
              ))}
            </select>
          </label>

          <input
            value={noteForm.title}
            onChange={(event) => setNoteForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Note title"
          />

          <div className="voice-actions">
            <button type="button" className="btn-secondary" onClick={listening ? stopVoiceNote : startVoiceNote}>
              {listening ? "Stop dictation" : "Start dictation"}
            </button>
            <span>{SpeechRecognition ? "Browser speech recognition ready" : "Speech API unavailable"}</span>
          </div>

          <textarea
            rows="6"
            value={noteForm.transcript}
            onChange={(event) => setNoteForm((current) => ({ ...current, transcript: event.target.value }))}
            placeholder="Dictated or typed clinical notes"
          />

          <textarea
            rows="3"
            value={noteForm.plan}
            onChange={(event) => setNoteForm((current) => ({ ...current, plan: event.target.value }))}
            placeholder="Care plan"
          />

          <button className="btn-primary" type="submit" disabled={!noteForm.patientId}>
            <FaSave aria-hidden="true" /> Save medical note
          </button>
        </form>
      </section>

      <section className="doctor-two-col">
        <div className="doctor-section">
          <h2>AI-assisted diagnosis suggestions</h2>
          <textarea
            rows="5"
            value={aiInput}
            onChange={(event) => setAiInput(event.target.value)}
            placeholder="Enter symptoms, exam findings, vitals, or dictated note"
          />
          <button className="btn-primary" onClick={askAI}>Generate suggestions</button>

          {aiResult && (
            <div className="ai-result">
              <strong>Urgency: {aiResult.urgency}</strong>
              <h3>Suggestions</h3>
              <ul>{aiResult.suggestions?.map((item) => <li key={item}>{item}</li>)}</ul>
              <h3>Care plan prompts</h3>
              <ul>{aiResult.carePlan?.map((item) => <li key={item}>{item}</li>)}</ul>
              <p>{aiResult.disclaimer}</p>
            </div>
          )}
        </div>

        <div className="doctor-section">
          <h2>Doctor availability management</h2>
          <label className="doctor-toggle">
            <input
              type="checkbox"
              checked={availableToday}
              onChange={(event) => setAvailableToday(event.target.checked)}
            />
            Available today
          </label>

          <div className="availability-stack">
            {availability.map((item, index) => (
              <div className="availability-row" key={index}>
                <input value={item.day} onChange={(event) => changeAvailability(index, "day", event.target.value)} placeholder="Day" />
                <input type="time" value={item.startTime} onChange={(event) => changeAvailability(index, "startTime", event.target.value)} />
                <input type="time" value={item.endTime} onChange={(event) => changeAvailability(index, "endTime", event.target.value)} />
                <select value={item.mode} onChange={(event) => changeAvailability(index, "mode", event.target.value)}>
                  <option value="both">Clinic + video</option>
                  <option value="clinic">Clinic</option>
                  <option value="video">Video</option>
                </select>
              </div>
            ))}
          </div>

          <button className="btn-secondary" onClick={addAvailabilityRow}>Add slot</button>
          <button className="btn-primary" onClick={saveAvailability}>Save availability</button>
        </div>
      </section>

      <section className="doctor-section">
        <h2>Recent clinical notes</h2>
        <div className="notes-list">
          {notes.slice(0, 5).map((note) => (
            <article key={note._id}>
              <strong>{note.title || "Clinical note"}</strong>
              <span>{note.patient?.name || selectedPatient?.name || "Patient"}</span>
              <p>{note.transcript || note.summary || note.plan}</p>
            </article>
          ))}
          {notes.length === 0 && <p className="empty-state">No notes yet.</p>}
        </div>
      </section>
    </main>
  );
}
