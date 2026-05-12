"use client";

import "../styles/navbar.css";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";
import { getCurrentUser, getToken } from "@/utils/auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Doctors", href: "/doctors" },
  { label: "Pharmacy", href: "/pharmacy" },
  { label: "Chat", href: "/chat" },
  { label: "Video Call", href: "/video-call" },
  { label: "Doctor Portal", href: "/doctor" },
];

const navGroups = [
  {
    label: "Services",
    items: [
      { label: "Lab Tests", href: "/lab-tests" },
      { label: "Hospital Beds", href: "/hospital" },
      { label: "Symptom Checker", href: "/symptoms" },
    ],
  },
  {
    label: "Health",
    items: [
      { label: "Vitals", href: "/vitals" },
      { label: "Medical History", href: "/medical-id" },
      { label: "Emergency Contacts", href: "/emergency-contacts" },
      { label: "Blood Donors", href: "/blood-donors" },
      { label: "Care Plans", href: "/care-plans" },
      { label: "Vaccines", href: "/vaccinations" },
      { label: "Reminders", href: "/reminders" },
      { label: "Prescriptions", href: "/prescriptions" },
      { label: "Family", href: "/family" },
    ],
  },
  {
    label: "Records",
    items: [
      { label: "Appointments", href: "/profile" },
      { label: "Orders", href: "/orders" },
      { label: "Reports", href: "/reports" },
      { label: "Security", href: "/security" },
    ],
  },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    const syncAuthState = () => {
      const token = getToken();
      const user = getCurrentUser();

      setLoggedIn(Boolean(token));
      setRole(user?.role || "");
    };

    syncAuthState();
    window.addEventListener("authchange", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("authchange", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, [pathname]);

  const goTo = (href) => {
    setOpen(false);
    setActiveGroup(null);
    router.push(href);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authchange"));
    setLoggedIn(false);
    setRole("");
    setOpen(false);
    setActiveGroup(null);
    router.push("/login");
  };

  const toggleGroup = (label) => {
    setActiveGroup((current) => current === label ? null : label);
  };

  return (
    <nav className="navbar">
      <button className="logo" onClick={() => goTo("/")}>
        MediCare
      </button>

      <ul className={`nav-links ${open ? "is-open" : ""}`}>
        {navItems.filter((item) => item.href !== "/doctor" || role === "doctor").map((item) => (
          <li key={item.href}>
            <button onClick={() => goTo(item.href)}>{item.label}</button>
          </li>
        ))}

        {navGroups.map((group) => (
          <li className="nav-menu-group" key={group.label}>
            <button
              className="nav-group-trigger"
              aria-expanded={activeGroup === group.label}
              onClick={() => toggleGroup(group.label)}
            >
              {group.label}
              <span aria-hidden="true">▾</span>
            </button>

            <div className={`nav-submenu ${activeGroup === group.label ? "is-open" : ""}`}>
              {group.items.map((item) => (
                <button key={item.href} onClick={() => goTo(item.href)}>
                  {item.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        {loggedIn && <NotificationBell />}

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
          onClick={() => {
            setOpen((value) => !value);
            setActiveGroup(null);
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
