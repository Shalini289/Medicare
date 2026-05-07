"use client";

import "../styles/navbar.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Doctors", href: "/doctors" },
  { label: "Pharmacy", href: "/pharmacy" },
  { label: "Lab Tests", href: "/lab-tests" },
  { label: "Orders", href: "/orders" },
  { label: "Appointments", href: "/profile" },
  { label: "Vitals", href: "/vitals" },
  { label: "Medical ID", href: "/medical-id" },
  { label: "Care Plans", href: "/care-plans" },
  { label: "Vaccines", href: "/vaccinations" },
  { label: "Reminders", href: "/reminders" },
  { label: "Prescriptions", href: "/prescriptions" },
  { label: "Chat", href: "/chat" },
  { label: "Family", href: "/family" },
];

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setLoggedIn(Boolean(localStorage.getItem("token")));
    });
  }, []);

  const goTo = (href) => {
    setOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setOpen(false);
    router.push("/login");
  };

  return (
    <nav className="navbar">
      <button className="logo" onClick={() => goTo("/")}>
        MediCare
      </button>

      <ul className={`nav-links ${open ? "is-open" : ""}`}>
        {navItems.map((item) => (
          <li key={item.href}>
            <button onClick={() => goTo(item.href)}>{item.label}</button>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        <NotificationBell />

        {loggedIn ? (
          <button className="btn-primary nav-auth" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="btn-primary nav-auth" onClick={() => goTo("/login")}>
            Login
          </button>
        )}

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
