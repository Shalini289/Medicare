"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/services/authService";
import "@/styles/login.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const submit = async () => {
    if (!email) return alert("Enter your email");

    try {
      setLoading(true);
      setMessage("");
      setResetUrl("");

      const res = await forgotPassword({ email });
      setMessage(res.msg || "If an account exists, a reset link has been sent.");
      if (res.resetUrl) setResetUrl(res.resetUrl);
    } catch (err) {
      alert(err.message || "Could not send reset link");
    } finally {
      setLoading(false);
    }
  };

  const openResetLink = () => {
    try {
      const url = new URL(resetUrl);
      router.push(`${url.pathname}${url.search}`);
    } catch {
      window.location.href = resetUrl;
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Forgot Password</h2>
        <p>Enter your account email and we will send a reset link.</p>

        <div className="login-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button className="login-btn" onClick={submit} disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </div>

        {message && <p className="auth-message">{message}</p>}
        {resetUrl && (
          <button className="dev-reset-link" onClick={openResetLink}>
            Open development reset link
          </button>
        )}

        <div className="login-footer">
          <span onClick={() => router.push("/login")}>Back to login</span>
        </div>
      </div>
    </div>
  );
}
