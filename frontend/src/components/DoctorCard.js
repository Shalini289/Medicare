"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import "../styles/card.css";
import "../styles/doctor.css";

export default function DoctorCard({ doctor }) {
  const router = useRouter();

  return (
    <div
      className="doctor-card"
      onClick={() => router.push(`/doctors/${doctor._id}`)}
    >
      <div className="doctor-img-wrap">
        <Image
          src={doctor.image || "/doc.png"}
          alt={doctor.name}
          width={80}
          height={80}
          sizes="80px"
        />
      </div>

      <div className="doctor-content">
        <h3>{doctor.name}</h3>
        <p className="spec">{doctor.specialization}</p>
        {doctor.hospital && <p className="hospital">{doctor.hospital}</p>}

        <div className="meta">
          <span>Rating {doctor.rating || "4.5"}</span>
          <span>{doctor.experience || 5} yrs</span>
        </div>

        <span className={`avail ${doctor.availableToday ? "today" : "tmw"}`}>
          {doctor.availableToday ? "Available today" : doctor.availability || "Next available"}
        </span>
      </div>

      <button
        className="book-btn"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/booking?id=${doctor._id}`);
        }}
      >
        Book Appointment
      </button>

      <button
        className="message-btn"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/chat?doctor=${doctor._id}`);
        }}
      >
        Message Doctor
      </button>

      <button
        className="message-btn"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/video-call?doctor=${doctor._id}`);
        }}
      >
        Start Video Call
      </button>
    </div>
  );
}
