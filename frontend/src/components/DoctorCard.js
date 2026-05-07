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

        <div className="meta">
          <span>Rating {doctor.rating || "4.5"}</span>
          <span>{doctor.experience || 5} yrs</span>
        </div>
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
    </div>
  );
}
