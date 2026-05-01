import Link from "next/link";
import "../styles/doctors.css";

const fallbackDoctors = [
  {
    _id: "cardiology",
    name: "Dr. Asha Mehta",
    specialization: "Cardiology",
    hospital: "MediCare Heart Centre",
    rating: 4.8,
    reviews: 128,
    availableToday: true,
  },
  {
    _id: "paediatrics",
    name: "Dr. Rohan Sinha",
    specialization: "Paediatrics",
    hospital: "MediCare Child Clinic",
    rating: 4.7,
    reviews: 96,
    availableToday: false,
  },
  {
    _id: "general",
    name: "Dr. Meera Kapoor",
    specialization: "General Physician",
    hospital: "MediCare City Hospital",
    rating: 4.9,
    reviews: 154,
    availableToday: true,
  },
];

export default function Doctors({ doctors = fallbackDoctors }) {
  const list = doctors.length > 0 ? doctors : fallbackDoctors;

  return (
    <section className="section section--alt">
      <div className="section-header">
        <div className="section-tag">Our specialists</div>
        <h2>Meet top-rated doctors</h2>
        <p>Verified doctors with excellent patient feedback</p>
      </div>

      <div className="doctors-grid">
        {list.map((d) => (
          <Link key={d._id} href="/doctors" className="doctor-card">
            <div className="doctor-avatar">
              {d.name.charAt(0)}
            </div>

            <h3>{d.name}</h3>
            <p className="spec">{d.specialization}</p>
            <p className="hospital">{d.hospital}</p>

            <div className="rating">
              Rating {d.rating || 4.5} ({d.reviews || 120})
            </div>

            <span className={`avail ${d.availableToday ? "today" : "tmw"}`}>
              {d.availableToday ? "Available Today" : "Available Tomorrow"}
            </span>

            <button className="book-btn">
              Book Now
            </button>
          </Link>
        ))}
      </div>

      <div className="doctors-cta">
        <Link href="/doctors" className="btn-ghost btn-large">
          View all doctors
        </Link>
      </div>
    </section>
  );
}
