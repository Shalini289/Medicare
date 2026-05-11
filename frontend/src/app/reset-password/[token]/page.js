"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resetPassword } from "@/services/authService";
import "@/styles/login.css";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!form.password || !form.confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      form.password.length < 8 ||
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/[0-9]/.test(form.password)
    ) {
      setError("Password must be 8+ characters and include uppercase, lowercase, and a number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      await resetPassword(token, { password: form.password });
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => router.push("/login"), 900);
    } catch (err) {
      setError(err.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Reset Password</h2>
        <p>Create a new password for your MediCare account.</p>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <div className="login-form">
          <input
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={(event) => {
              setForm((current) => ({ ...current, password: event.target.value }));
              setError("");
            }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={(event) => {
              setForm((current) => ({ ...current, confirmPassword: event.target.value }));
              setError("");
            }}
            onKeyDown={(event) => event.key === "Enter" && submit()}
          />

          <ul className="password-rules reset-password-rules" aria-label="Password requirements">
            <li className={form.password.length >= 8 ? "met" : ""}>8+ characters</li>
            <li className={/[A-Z]/.test(form.password) ? "met" : ""}>Uppercase letter</li>
            <li className={/[a-z]/.test(form.password) ? "met" : ""}>Lowercase letter</li>
            <li className={/[0-9]/.test(form.password) ? "met" : ""}>Number</li>
          </ul>

          <button className="login-btn" onClick={submit} disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </div>
      </div>
    </div>
  );
}
