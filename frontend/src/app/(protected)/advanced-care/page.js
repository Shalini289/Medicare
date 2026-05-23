"use client";

import Link from "next/link";
import {
  FaBell,
  FaChartLine,
  FaClinicMedical,
  FaFilePrescription,
  FaMicrophone,
  FaNotesMedical,
  FaQrcode,
  FaRobot,
  FaRupeeSign,
  FaUsers,
} from "react-icons/fa";
import "@/styles/advancedCare.css";

const features = [
  {
    title: "AI Symptom Checker",
    status: "Live",
    icon: FaRobot,
    href: "/symptoms",
    description: "Users describe symptoms before booking so the system can suggest care direction and urgency.",
    features: ["Probable specialization", "Urgency level", "Relevant doctor flow"],
    tech: ["NLP", "Decision trees", "AI API integration", "Dynamic questionnaires"],
  },
  {
    title: "Smart Appointment Queue",
    status: "Live",
    icon: FaClinicMedical,
    href: "/appointment-queue",
    description: "Clinic queue logic for tokens, wait time prediction, delay alerts, and live appointment movement.",
    features: ["Realtime wait time", "Token system", "Delay prediction", "Patient notifications"],
    tech: ["WebSockets", "Event-driven architecture", "Realtime updates"],
  },
  {
    title: "Emergency One-Tap Health Share",
    status: "Live",
    icon: FaQrcode,
    href: "/emergency-contacts",
    description: "Patients can keep emergency contacts and medical details ready for fast sharing during urgent care.",
    features: ["Medical history", "Allergies and blood group", "Live location alert", "Family/hospital sharing"],
    tech: ["Temporary secure links", "Geo APIs", "Emergency profile"],
  },
  {
    title: "AI Prescription Analyzer",
    status: "Live",
    icon: FaFilePrescription,
    href: "/prescription-analyzer",
    description: "Prescription upload workflow for extracting medicine names, dosage, safety notes, and adherence support.",
    features: ["Medicine extraction", "Dosage explanation", "Interaction warnings", "Reminder creation"],
    tech: ["OCR", "Image processing", "AI integration"],
  },
  {
    title: "Family Health Dashboard",
    status: "Live",
    icon: FaUsers,
    href: "/family",
    description: "One account can manage family members, appointments, prescriptions, and shared health context.",
    features: ["Parents' records", "Child vaccination tracking", "Family appointment history", "Shared insurance context"],
    tech: ["Multi-profile data model", "Role-safe records", "Reusable care modules"],
  },
  {
    title: "Health EMI Eligibility Predictor",
    status: "Live",
    icon: FaRupeeSign,
    href: "/health-emi",
    description: "Fintech-healthcare module for predicting EMI eligibility and recommended healthcare payment plans.",
    features: ["EMI eligibility", "Plan recommendation", "Risk scoring", "Admin review"],
    tech: ["Credit APIs", "Risk engine", "ML scoring"],
  },
  {
    title: "Doctor Availability Prediction",
    status: "Planned",
    icon: FaChartLine,
    href: "/doctors",
    description: "Predicts low-wait slots and peak traffic so users can book at better consultation times.",
    features: ["Best consultation time", "Low waiting slots", "Peak traffic analytics"],
    tech: ["Historical booking data", "Analytics", "Prediction models"],
  },
  {
    title: "Voice-Based Rural Assistant",
    status: "Live",
    icon: FaMicrophone,
    href: "/voice-assistant",
    description: "Voice-first access for rural users who prefer Hindi or regional language healthcare workflows.",
    features: ["Hindi voice assistant", "Voice booking", "Prescription reading", "Regional language support"],
    tech: ["Speech recognition", "Text-to-speech", "Regional NLP"],
  },
  {
    title: "Medicine Reminder + Adherence",
    status: "Live",
    icon: FaBell,
    href: "/reminders",
    description: "Patients can track medicines, reminders, and adherence patterns for daily care consistency.",
    features: ["Smart reminders", "Daily streaks", "Critical skip alerts", "Doctor notification idea"],
    tech: ["Push notifications", "Cron jobs", "Analytics"],
  },
  {
    title: "Offline-to-Online Clinic System",
    status: "Live",
    icon: FaNotesMedical,
    href: "/offline-clinic",
    description: "Lightweight clinic mode for storing visits offline and syncing when internet returns.",
    features: ["Offline patient storage", "Sync on reconnect", "Clinic dashboard", "Low bandwidth support"],
    tech: ["Local storage/IndexedDB", "Sync queues", "Conflict resolution"],
  },
];

const statusClass = {
  Live: "is-live",
  Planned: "is-planned",
};

export default function AdvancedCarePage() {
  return (
    <main className="advanced-care-page">
      <section className="advanced-care-hero">
        <div>
          <span className="eyebrow">Smart healthcare roadmap</span>
          <h1>Advanced Care Features</h1>
          <p>
            Product-level healthcare modules that make MediCare stronger for real users,
            interviews, and scalable healthcare workflows.
          </p>
        </div>
      </section>

      <section className="advanced-feature-grid">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article className="advanced-feature-card" key={feature.title}>
              <div className="advanced-feature-card__head">
                <span className="advanced-feature-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className={`advanced-status ${statusClass[feature.status]}`}>
                  {feature.status}
                </span>
              </div>

              <h2>{feature.title}</h2>
              <p>{feature.description}</p>

              <div className="advanced-feature-columns">
                <div>
                  <h3>Features</h3>
                  <ul>
                    {feature.features.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3>Tech discussion</h3>
                  <ul>
                    {feature.tech.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <Link href={feature.href}>Open related module</Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
