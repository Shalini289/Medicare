"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaFlask, FaHospital, FaMapMarkerAlt, FaTint, FaUserMd } from "react-icons/fa";
import { getDoctors } from "@/services/doctorService";
import { getLabTests } from "@/services/labTestService";
import { findBloodDonors } from "@/services/bloodDonorService";
import { api } from "@/utils/api";

const normalize = (value) => String(value || "").toLowerCase().trim();

const includesLocation = (values, location) => {
  const query = normalize(location);
  if (!query) return true;
  return values.some((value) => normalize(value).includes(query));
};

const serviceTypes = [
  { id: "all", label: "All services" },
  { id: "hospitals", label: "Hospitals" },
  { id: "doctors", label: "Doctors" },
  { id: "labs", label: "Lab tests" },
  { id: "donors", label: "Blood donors" },
];

const getAvailableBeds = (hospital) => {
  const beds = hospital.beds || {};
  const occupied = hospital.occupiedBeds || {};

  return {
    ICU: Math.max(Number(beds.ICU || 0) - Number(occupied.ICU || 0), 0),
    oxygen: Math.max(Number(beds.oxygen || 0) - Number(occupied.oxygen || 0), 0),
    general: Math.max(Number(beds.general || 0) - Number(occupied.general || 0), 0),
  };
};

export default function FindCarePage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [serviceType, setServiceType] = useState("all");
  const [query, setQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [hospitalData, doctorData, labData, donorData] = await Promise.all([
        api("/api/hospital"),
        getDoctors(),
        getLabTests("All"),
        findBloodDonors({ available: "true" }).catch(() => []),
      ]);

      setHospitals(Array.isArray(hospitalData) ? hospitalData : []);
      setDoctors(Array.isArray(doctorData) ? doctorData : []);
      setLabTests(Array.isArray(labData.tests) ? labData.tests : []);
      setDonors(Array.isArray(donorData) ? donorData : []);
    } catch (err) {
      setError(err.message || "Could not load nearby care services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadData();
    });
  }, [loadData]);

  const results = useMemo(() => {
    const search = normalize(query);
    const matchesSearch = (values) => !search || values.some((value) => normalize(value).includes(search));
    const next = [];

    if (serviceType === "all" || serviceType === "hospitals") {
      hospitals
        .filter((hospital) => includesLocation([hospital.city, hospital.address, hospital.name], location))
        .filter((hospital) => matchesSearch([hospital.name, hospital.city, hospital.address, hospital.status]))
        .forEach((hospital) => {
          const available = getAvailableBeds(hospital);
          next.push({
            id: `hospital-${hospital._id}`,
            type: "Hospital",
            icon: FaHospital,
            title: hospital.name || "Hospital",
            subtitle: [hospital.city, hospital.status].filter(Boolean).join(" | "),
            detail: hospital.address || "Address not listed",
            meta: `Available beds: ICU ${available.ICU}, Oxygen ${available.oxygen}, General ${available.general}`,
            action: "View beds",
            onClick: () => router.push("/hospital"),
          });
        });
    }

    if (serviceType === "all" || serviceType === "doctors") {
      doctors
        .filter((doctor) => includesLocation([doctor.city, doctor.address, doctor.hospital, doctor.availability], location))
        .filter((doctor) => matchesSearch([doctor.name, doctor.specialization, doctor.hospital, doctor.city]))
        .forEach((doctor) => {
          next.push({
            id: `doctor-${doctor._id}`,
            type: "Doctor",
            icon: FaUserMd,
            title: doctor.name || "Doctor",
            subtitle: doctor.specialization || "Specialist",
            detail: [doctor.hospital, doctor.city].filter(Boolean).join(" | ") || "Location not listed",
            meta: `${doctor.experience || 0} yrs experience | Rs ${doctor.fees || 0}`,
            action: "Book doctor",
            onClick: () => router.push(`/booking?id=${doctor._id}`),
          });
        });
    }

    if (serviceType === "all" || serviceType === "labs") {
      labTests
        .filter((test) => matchesSearch([test.name, test.category, test.description, test.sampleType]))
        .forEach((test) => {
          next.push({
            id: `lab-${test._id}`,
            type: "Lab test",
            icon: FaFlask,
            title: test.name,
            subtitle: `${test.category} | ${test.sampleType} sample`,
            detail: location ? `Home collection available in ${location}` : "Home sample collection available",
            meta: `${test.reportTime} report | Rs ${test.price}`,
            action: "Book lab test",
            onClick: () => router.push("/lab-tests"),
          });
        });
    }

    if (serviceType === "all" || serviceType === "donors") {
      donors
        .filter((donor) => includesLocation([donor.city], location))
        .filter((donor) => matchesSearch([donor.name, donor.bloodGroup, donor.city, donor.notes]))
        .forEach((donor) => {
          next.push({
            id: `donor-${donor._id}`,
            type: "Blood donor",
            icon: FaTint,
            title: `${donor.name} (${donor.bloodGroup})`,
            subtitle: donor.city || "City not listed",
            detail: donor.emergencyOnly ? "Emergency requests only" : "Available donor",
            meta: donor.available ? "Available now" : "Not currently available",
            action: "Open donors",
            onClick: () => router.push("/blood-donors"),
          });
        });
    }

    return next;
  }, [doctors, donors, hospitals, labTests, location, query, router, serviceType]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Location detection is not supported in this browser. Enter your city manually.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setError("Location detected. Please type your city name to match available records."),
      () => setError("Could not access location. Enter your city manually.")
    );
  };

  return (
    <main className="find-care-page">
      <section className="find-care-hero">
        <div>
          <span className="eyebrow">Location search</span>
          <h1>Find Care Nearby</h1>
          <p>Search hospitals, doctors, diagnostics, and emergency donor support by city or area.</p>
        </div>
        <button className="btn-secondary" onClick={detectLocation}>
          <FaMapMarkerAlt aria-hidden="true" />
          Use my location
        </button>
      </section>

      {error && <p className="find-care-alert">{error}</p>}

      <section className="find-care-controls">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Enter city or area, e.g. Bhopal"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search doctor, test, hospital, blood group"
        />
        <select value={serviceType} onChange={(event) => setServiceType(event.target.value)}>
          {serviceTypes.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </section>

      <section className="find-care-summary">
        <span>{results.length} results</span>
        <span>{hospitals.length} hospitals</span>
        <span>{doctors.length} doctors</span>
        <span>{labTests.length} lab tests</span>
        <span>{donors.length} donors</span>
      </section>

      {loading ? (
        <p className="empty-state">Loading care services...</p>
      ) : results.length === 0 ? (
        <p className="empty-state">No care services found for this location.</p>
      ) : (
        <section className="find-care-grid">
          {results.map((item) => {
            const Icon = item.icon;

            return (
              <article className="find-care-card" key={item.id}>
                <div className="find-care-card__icon">
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <span>{item.type}</span>
                  <h2>{item.title}</h2>
                  <p>{item.subtitle}</p>
                  <p>{item.detail}</p>
                  <strong>{item.meta}</strong>
                </div>
                <button className="btn-primary" onClick={item.onClick}>{item.action}</button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
