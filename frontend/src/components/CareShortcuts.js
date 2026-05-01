import Link from "next/link";
import "../styles/careShortcuts.css";

const shortcuts = [
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
