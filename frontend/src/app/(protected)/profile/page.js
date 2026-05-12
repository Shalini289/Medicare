"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalendarCheck,
  FaFileMedical,
  FaHeartbeat,
  FaHospitalUser,
  FaIdCard,
  FaLock,
  FaNotesMedical,
  FaPills,
  FaUserCircle,
} from "react-icons/fa";
import { cancelAppointment, getMyAppointments } from "@/services/appointmentService";
import { getProfile, updateProfile } from "@/services/authService";
import AppointmentCard from "@/components/AppointmentCard";
import { getCurrentUser } from "@/utils/auth";
import "@/styles/appointment.css";

const roleLabels = {
  user: "Patient",
  doctor: "Doctor",
  pharmacy: "Pharmacy",
  admin: "Admin",
};

const baseQuickLinks = [
  { href: "/medical-id", label: "Medical ID", icon: FaIdCard },
  { href: "/prescriptions", label: "Prescriptions", icon: FaNotesMedical },
  { href: "/reports", label: "Reports", icon: FaFileMedical },
  { href: "/vitals", label: "Vitals", icon: FaHeartbeat },
  { href: "/pharmacy", label: "Medicines", icon: FaPills },
  { href: "/emergency-contacts", label: "Emergency", icon: FaHospitalUser },
];

const roleQuickLinks = {
  doctor: [{ href: "/doctor", label: "Doctor Portal", icon: FaUserCircle }],
  pharmacy: [{ href: "/pharmacy", label: "Pharmacy Portal", icon: FaPills }],
  admin: [{ href: "/admin", label: "Admin Portal", icon: FaLock }],
};

const formatDate = (date) => {
  if (!date) return "Not available";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "Not available";
  }
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const applyProfile = useCallback((user) => {
    if (!user) return;

    setProfile(user);
    setForm({
      name: user.name || "",
      phone: user.phone || "",
    });
  }, []);

  const loadProfilePage = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const fallbackUser = getCurrentUser();
      applyProfile(fallbackUser);

      const [profileResult, appointmentResult] = await Promise.allSettled([
        getProfile(),
        getMyAppointments(),
      ]);

      if (profileResult.status === "fulfilled") {
        applyProfile(profileResult.value.user || profileResult.value);
      } else {
        setError(profileResult.reason?.message || "Could not load your account details");
      }

      if (appointmentResult.status === "fulfilled") {
        setAppointments(Array.isArray(appointmentResult.value) ? appointmentResult.value : []);
      } else {
        setError(appointmentResult.reason?.message || "Could not load appointments");
      }
    } finally {
      setLoading(false);
    }
  }, [applyProfile]);

  useEffect(() => {
    queueMicrotask(() => {
      loadProfilePage();
    });
  }, [loadProfilePage]);

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

  const upcomingAppointment = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.status !== "cancelled")
      .sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`))[0];
  }, [appointments]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(profile?.name),
      Boolean(profile?.email),
      Boolean(profile?.phone),
      counts.all > 0,
      counts.booked > 0,
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [counts.all, counts.booked, profile]);

  const quickLinks = useMemo(() => {
    return [...(roleQuickLinks[profile?.role] || []), ...baseQuickLinks];
  }, [profile?.role]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      const res = await updateProfile(form);
      applyProfile(res.user);
      setNotice(res.msg || "Profile updated successfully");
    } catch (err) {
      setError(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;

    try {
      await cancelAppointment(id);
      setAppointments(prev =>
        prev.map(item =>
          item._id === id ? { ...item, status: "cancelled" } : item
        )
      );
      setNotice("Appointment cancelled");
    } catch (err) {
      setError(err.message || "Could not cancel appointment");
    }
  };

  const handleRebook = (appointment) => {
    router.push(`/booking?id=${appointment.doctor?._id || appointment.doctor}`);
  };

  if (loading) return <p className="center">Loading profile...</p>;

  return (
    <main className="profile-page profile-hub">
      <section className="profile-hero">
        <div className="profile-identity">
          <div className="profile-avatar" aria-hidden="true">
            {getInitials(profile?.name)}
          </div>
          <div>
            <span className="eyebrow">My profile</span>
            <h1>{profile?.name || "Your profile"}</h1>
            <p>{roleLabels[profile?.role] || "Account"} account since {formatDate(profile?.createdAt)}</p>
          </div>
        </div>

        <div className="profile-hero-actions">
          <Link className="btn-secondary" href="/notifications">
            Notifications
          </Link>
          <Link className="btn-primary" href="/doctors">
            Book appointment
          </Link>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}
      {notice && <p className="form-success">{notice}</p>}

      <section className="profile-overview">
        <form className="profile-card profile-form" onSubmit={handleProfileSubmit}>
          <div className="profile-card-title">
            <FaUserCircle aria-hidden="true" />
            <h2>Account details</h2>
          </div>

          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              minLength={2}
              required
            />
          </label>

          <label>
            Email
            <input value={profile?.email || "Not available"} disabled />
          </label>

          <label>
            Phone
            <input
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              placeholder="+91 98765 43210"
            />
          </label>

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>

        <div className="profile-card">
          <div className="profile-card-title">
            <FaHeartbeat aria-hidden="true" />
            <h2>Care readiness</h2>
          </div>

          <div className="profile-progress" aria-label={`Profile completion ${completion}%`}>
            <strong>{completion}%</strong>
            <span>complete</span>
          </div>

          <div className="profile-progress-track">
            <span style={{ width: `${completion}%` }} />
          </div>

          <p>Add contact details and keep appointments active to improve your care profile.</p>
        </div>

        <div className="profile-card">
          <div className="profile-card-title">
            <FaCalendarCheck aria-hidden="true" />
            <h2>Next appointment</h2>
          </div>

          {upcomingAppointment ? (
            <div className="profile-next">
              <strong>{upcomingAppointment.doctor?.name || "Doctor"}</strong>
              <span>{upcomingAppointment.doctor?.specialization || "General consultation"}</span>
              <p>{upcomingAppointment.date} at {upcomingAppointment.time}</p>
            </div>
          ) : (
            <div className="profile-next">
              <span>No upcoming appointment.</span>
              <Link href="/doctors">Find a doctor</Link>
            </div>
          )}
        </div>
      </section>

      <section className="profile-quick-links" aria-label="Profile quick links">
        {quickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link href={item.href} key={`${item.href}-${item.label}`}>
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </section>

      <div className="appointment-header">
        <div>
          <h1>My Appointments</h1>
          <p>Track, filter, cancel, or rebook your consultations.</p>
        </div>
      </div>

      <div className="appointment-summary">
        <button className={status === "all" ? "active" : ""} onClick={() => setStatus("all")}>All {counts.all}</button>
        <button className={status === "booked" ? "active" : ""} onClick={() => setStatus("booked")}>Booked {counts.booked}</button>
        <button className={status === "cancelled" ? "active" : ""} onClick={() => setStatus("cancelled")}>Cancelled {counts.cancelled}</button>
        <button className={status === "completed" ? "active" : ""} onClick={() => setStatus("completed")}>Completed {counts.completed}</button>
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

      {filteredAppointments.length === 0 && <p className="empty-state">No appointments found</p>}

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
    </main>
  );
}
