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

  const submit = async () => {
    if (!form.password || !form.confirmPassword) {
      return alert("Please fill all fields");
    }

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);
      await resetPassword(token, { password: form.password });
      alert("Password reset successful");
      router.push("/login");
    } catch (err) {
      alert(err.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Reset Password</h2>
        <p>Create a new password for your MediCare account.</p>

        <div className="login-form">
          <input
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
          />

          <button className="login-btn" onClick={submit} disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </div>
      </div>
    </div>
  );
}
