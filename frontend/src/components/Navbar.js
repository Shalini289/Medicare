"use client";

import "../styles/navbar.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);

  // Check token on load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setLoggedIn(true);
    }
  }, []);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");

    setLoggedIn(false);

    router.push("/login");
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="logo" onClick={() => router.push("/")}>
        MediCare
      </div>

      {/* NAV LINKS */}
      <ul className="nav-links">
        <li onClick={() => router.push("/doctors")}>Doctors</li>
        <li onClick={() => router.push("/pharmacy")}>Pharmacy</li>
        <li onClick={() => router.push("/orders")}>Orders</li>
        <li onClick={() => router.push("/profile")}>Appointments</li>
        <li onClick={() => router.push("/chat")}>Chat</li>
      </ul>

      {/* RIGHT SIDE */}
      <div className="nav-right">

        <NotificationBell />

        {loggedIn ? (
          <button
            className="btn-primary"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <button
              className="btn-primary"
              onClick={() => router.push("/login")}
            >
              Login
            </button>

           
          </>
        )}

      </div>

    </nav>
  );
}