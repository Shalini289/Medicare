"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaSms } from "react-icons/fa";
import { io } from "socket.io-client";
import { api } from "../../utils/api";
import { getApiUrl } from "@/utils/runtimeConfig";

const cleanPhone = (phone = "") => String(phone || "").replace(/[^\d+]/g, "");

const getContactPhone = (hospital) =>
  hospital.emergencyPhone || hospital.phone || "";

export default function HospitalPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("all");
  const [bedType, setBedType] = useState("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const loadHospitals = useCallback(async () => {
    try {
      const data = await api("/api/hospital");
      setHospitals(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadHospitals();
    });
  }, [loadHospitals]);

  useEffect(() => {
    const socketUrl = getApiUrl();

    if (!socketUrl) return undefined;

    const socket = io(socketUrl);

    socket.on("bedUpdate", (updated) => {
      setHospitals(prev =>
        prev.map(h =>
          h._id === updated._id ? updated : h
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  const cities = useMemo(() => {
    return ["all", ...new Set(hospitals.map((h) => h.city).filter(Boolean))];
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const beds = hospital.beds || {};
      const totalBeds = Number(beds.ICU || 0) + Number(beds.oxygen || 0) + Number(beds.general || 0);
      const selectedBeds = bedType === "all" ? totalBeds : Number(beds[bedType] || 0);

      if (city !== "all" && hospital.city !== city) return false;
      if (onlyAvailable && selectedBeds <= 0) return false;
      return true;
    });
  }, [bedType, city, hospitals, onlyAvailable]);

  const totals = useMemo(() => {
    return filteredHospitals.reduce(
      (sum, hospital) => {
        const beds = hospital.beds || {};
        return {
          ICU: sum.ICU + Number(beds.ICU || 0),
          oxygen: sum.oxygen + Number(beds.oxygen || 0),
          general: sum.general + Number(beds.general || 0),
        };
      },
      { ICU: 0, oxygen: 0, general: 0 }
    );
  }, [filteredHospitals]);

  if (loading) return <p className="center">Loading hospitals...</p>;

  return (
    <div className="hospital-page">
      <div className="hospital-header">
        <h1>Hospital Availability</h1>
        <p>Check real-time bed availability in nearby hospitals</p>
      </div>

      <div className="hospital-controls">
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All Cities" : item}
            </option>
          ))}
        </select>

        <select value={bedType} onChange={(e) => setBedType(e.target.value)}>
          <option value="all">All Beds</option>
          <option value="ICU">ICU</option>
          <option value="oxygen">Oxygen</option>
          <option value="general">General</option>
        </select>

        <label className="hospital-toggle">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          Available only
        </label>
      </div>

      <div className="hospital-summary">
        <span>ICU: {totals.ICU}</span>
        <span>Oxygen: {totals.oxygen}</span>
        <span>General: {totals.general}</span>
      </div>

      {filteredHospitals.length === 0 && (
        <p className="empty">No hospital data available</p>
      )}

      <div className="hospital-grid">
        {filteredHospitals.map(h => (
          <div key={h._id} className="hospital-card">
            {(() => {
              const contactPhone = getContactPhone(h);
              const cleanContact = cleanPhone(contactPhone);
              const smsBody = encodeURIComponent(
                `Hello ${h.name}, I need bed availability details for ${bedType === "all" ? "available beds" : bedType} beds.`
              );

              return (
                <>
            <div className="hospital-top">
              <h3>{h.name}</h3>
              <span className="city">{h.city}</span>
            </div>

            {(h.address || contactPhone) && (
              <div className="hospital-contact-info">
                {h.address && (
                  <p>
                    <FaMapMarkerAlt aria-hidden="true" />
                    {h.address}
                  </p>
                )}
                {contactPhone && (
                  <p>
                    <FaPhoneAlt aria-hidden="true" />
                    {contactPhone}
                  </p>
                )}
              </div>
            )}

            <div className="beds">
              <div className="bed icu">
                <span>ICU</span>
                <strong>{h.beds?.ICU || 0}</strong>
              </div>

              <div className="bed oxygen">
                <span>Oxygen</span>
                <strong>{h.beds?.oxygen || 0}</strong>
              </div>

              <div className="bed general">
                <span>General</span>
                <strong>{h.beds?.general || 0}</strong>
              </div>
            </div>

            <div className="hospital-contact-actions">
              {cleanContact ? (
                <>
                  <a href={`tel:${cleanContact}`}>
                    <FaPhoneAlt aria-hidden="true" />
                    Call hospital
                  </a>
                  <a href={`sms:${cleanContact}?body=${smsBody}`}>
                    <FaSms aria-hidden="true" />
                    Send SMS
                  </a>
                </>
              ) : (
                <span>No contact number available</span>
              )}
            </div>
                </>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
