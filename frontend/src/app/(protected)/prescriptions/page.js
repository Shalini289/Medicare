"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFilePrescription, FaPrint } from "react-icons/fa";
import { getPrescriptions } from "@/services/prescriptionService";
import "@/styles/prescriptions.css";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPrescriptions();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load prescriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadPrescriptions();
    });
  }, [loadPrescriptions]);

  const visiblePrescriptions = useMemo(() => {
    if (filter === "all") return prescriptions;
    return prescriptions.filter((item) => item.status === filter);
  }, [filter, prescriptions]);

  const totals = useMemo(() => ({
    active: prescriptions.filter((item) => item.status === "active").length,
    medicines: prescriptions.reduce((sum, item) => sum + (item.medicines?.length || 0), 0),
    completed: prescriptions.filter((item) => item.status === "completed").length,
  }), [prescriptions]);

  return (
    <main className="prescriptions-page">
      <section className="prescriptions-hero">
        <div>
          <span className="eyebrow">Doctor-issued records</span>
          <h1>Prescriptions</h1>
          <p>View prescriptions issued by your doctor, print digital copies, and order prescribed medicines from the pharmacy.</p>
        </div>

        <div className="prescription-stats">
          <span><strong>{totals.active}</strong> Active</span>
          <span><strong>{totals.medicines}</strong> Medicines</span>
          <span><strong>{totals.completed}</strong> Completed</span>
        </div>
      </section>

      <section className="patient-prescription-layout">
        <div className="prescription-info-panel">
          <FaFilePrescription aria-hidden="true" />
          <h2>Prescriptions are created by doctors</h2>
          <p>Patients can view, print, and order medicines from prescriptions. New prescriptions are issued from the Doctor Portal after consultation.</p>
          <Link href="/doctor">Doctor Portal</Link>
        </div>

        <div className="prescription-panel">
          {error && <p className="form-error">{error}</p>}

          <div className="filter-tabs">
            {["active", "completed", "archived", "all"].map((item) => (
              <button
                key={item}
                className={filter === item ? "is-selected" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="empty-state">Loading prescriptions...</p>
          ) : visiblePrescriptions.length === 0 ? (
            <p className="empty-state">No doctor-issued prescriptions in this view.</p>
          ) : (
            <div className="prescription-list">
              {visiblePrescriptions.map((prescription) => {
                const doctorName = prescription.doctor?.name || prescription.doctorName || "Doctor";

                return (
                  <article className="prescription-card" key={prescription._id}>
                    <div className="prescription-card__head">
                      <div>
                        <span className="status-pill">{prescription.status}</span>
                        <h3>{prescription.diagnosis || "Prescription"}</h3>
                        <strong className="rx-code">{prescription.prescriptionCode || "Digital Rx"}</strong>
                        <p>
                          {[doctorName, prescription.issuedDate && new Date(prescription.issuedDate).toLocaleDateString()]
                            .filter(Boolean)
                            .join(" | ")}
                        </p>
                        {prescription.doctor?.specialization && (
                          <p>{prescription.doctor.specialization} - {prescription.doctor.hospital || "MediCare"}</p>
                        )}
                      </div>

                      <div className="prescription-actions">
                        <button title="Print digital prescription" onClick={() => window.print()}>
                          <FaPrint aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="prescription-medicines">
                      {prescription.medicines?.map((medicine) => (
                        <div className="prescription-medicine" key={medicine._id || medicine.name}>
                          <div>
                            <strong>{medicine.name}</strong>
                            <small>
                              {[medicine.dosage, medicine.frequency, medicine.duration]
                                .filter(Boolean)
                                .join(" | ")}
                            </small>
                            {medicine.instructions && <p>{medicine.instructions}</p>}
                          </div>
                          <Link href={`/pharmacy?q=${encodeURIComponent(medicine.name)}`}>
                            Order
                          </Link>
                        </div>
                      ))}
                    </div>

                    <div className="rx-meta">
                      {prescription.validUntil && (
                        <span>Valid until {new Date(prescription.validUntil).toLocaleDateString()}</span>
                      )}
                      {prescription.followUpDate && (
                        <span>Follow-up {new Date(prescription.followUpDate).toLocaleDateString()}</span>
                      )}
                      {prescription.digitalSignature && (
                        <span>Signed by {prescription.digitalSignature}</span>
                      )}
                    </div>

                    {prescription.patientInstructions && (
                      <p className="prescription-instructions">{prescription.patientInstructions}</p>
                    )}

                    {prescription.notes && <p className="prescription-notes">{prescription.notes}</p>}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
