"use client";

import { useEffect, useMemo, useState } from "react";
import { getDoctors } from "../../services/doctorService";
import DoctorCard from "../../components/DoctorCard";
import Loader from "../../components/Loader";

export default function DoctorsPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch doctors
  useEffect(() => {
    getDoctors()
      .then(res => {
        const list = Array.isArray(res) ? res : [];
        setData(list);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter and search
  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q)
      );
    }

    if (spec !== "all") {
      result = result.filter(d => d.specialization === spec);
    }

    return result;
  }, [search, spec, data]);

  // Unique specializations
  const specializations = [
    "all",
    ...new Set(data.map(d => d.specialization))
  ];

  if (loading) return <Loader />;

  return (
    <div className="doctor-page">

      {/* HEADER */}
      <div className="doctor-header">
        <h1>Find Doctors</h1>
        <p>Book appointments with trusted specialists</p>
      </div>

      {/* CONTROLS */}
      <div className="doctor-controls">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FILTER */}
        <select
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
        >
          {specializations.map((s, i) => (
            <option key={i} value={s}>
              {s === "all" ? "All Specializations" : s}
            </option>
          ))}
        </select>

      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="doctor-empty">
          <p>No doctors found</p>
        </div>
      )}

      {/* GRID */}
      <div className="doctor-grid">
        {filtered.map(d => (
          <DoctorCard key={d._id} doctor={d} />
        ))}
      </div>

    </div>
  );
}
