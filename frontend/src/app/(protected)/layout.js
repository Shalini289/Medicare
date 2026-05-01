"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // checking | authed | redirecting

  useEffect(() => {
    queueMicrotask(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus("redirecting");
        router.replace("/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setStatus("redirecting");
          router.replace("/login");
        } else {
          setStatus("authed");
        }
      } catch {
        setStatus("redirecting");
        router.replace("/login");
      }
    });
  }, [router]);

  if (status !== "authed") {
    return (
      <div className="auth-gate">
        <div className="auth-gate__card">
          <div className="auth-gate__logo">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="url(#grad)" />
              <path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#F7C4D2" />
                  <stop offset="1" stopColor="#FABF99" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h2 className="auth-gate__brand">MediCare</h2>

          <div className="auth-gate__spinner">
            <div className="auth-gate__spinner-ring" />
          </div>

          <p className="auth-gate__msg">
            {status === "redirecting"
              ? "Redirecting to login..."
              : "Verifying your session..."}
          </p>
        </div>
      </div>
    );
  }

  return children;
}
