import Link from "next/link";
import "../styles/careShortcuts.css";

const shortcuts = [
  {
    title: "Patient dashboard",
    text: "See appointments, alerts, reminders, and recent activity.",
    href: "/dashboard",
    label: "Open dashboard",
  },
  {
    title: "Find a doctor",
    text: "Search specialists and book an available slot.",
    href: "/doctors",
    label: "Browse doctors",
  },
  {
    title: "Check symptoms",
    text: "Get structured guidance before your appointment.",
    href: "/symptoms",
    label: "Start check",
  },
  {
    title: "Upload reports",
    text: "Store reports and review extracted insights.",
    href: "/reports",
    label: "Upload report",
  },
  {
    title: "Track vitals",
    text: "Log BP, sugar, pulse, oxygen, and temperature.",
    href: "/vitals",
    label: "Add reading",
  },
  {
    title: "Lab tests",
    text: "Book home sample collection and view lab bookings.",
    href: "/lab-tests",
    label: "Book tests",
  },
  {
    title: "Medical ID",
    text: "Keep emergency contacts, allergies, and conditions ready.",
    href: "/medical-id",
    label: "Update ID",
  },
  {
    title: "Care plans",
    text: "Track recovery routines, goals, and daily care tasks.",
    href: "/care-plans",
    label: "View plans",
  },
  {
    title: "Vaccinations",
    text: "Track due dates, completed doses, and certificates.",
    href: "/vaccinations",
    label: "Open tracker",
  },
  {
    title: "Medicine reminders",
    text: "Schedule doses and track what you have taken.",
    href: "/reminders",
    label: "Set reminder",
  },
  {
    title: "Prescriptions",
    text: "Save prescribed medicines and order refills faster.",
    href: "/prescriptions",
    label: "Open list",
  },
  {
    title: "Hospital beds",
    text: "View city-wise real-time bed availability.",
    href: "/hospital",
    label: "Check beds",
  },
];

export default function CareShortcuts() {
  return (
    <section className="care-shortcuts">
      <div className="care-shortcuts__head">
        <span>Quick access</span>
        <h2>What do you need right now?</h2>
      </div>

      <div className="care-shortcuts__grid">
        {shortcuts.map((item) => (
          <Link key={item.href} href={item.href} className="care-shortcut">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <strong>{item.label}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
