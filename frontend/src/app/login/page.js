"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, verifyTwoFactorLogin } from "@/services/authService";
import { getCurrentUser } from "@/utils/auth";
import "../../styles/login.css";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [twoFactor, setTwoFactor] = useState({
    required: false,
    tempToken: "",
    code: "",
    devCode: "",
  });
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const goAfterLogin = () => {
    const user = getCurrentUser();
    if (user?.role === "doctor") {
      router.push("/doctor");
      return;
    }

    if (user?.role === "pharmacy") {
      router.push("/pharmacy");
      return;
    }

    router.push("/dashboard");
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return alert("Please fill all fields");
    }

    try {
      setLoading(true);

      const res = await login(form);

      if (res.requiresTwoFactor) {
        setTwoFactor({
          required: true,
          tempToken: res.tempToken,
          code: "",
          devCode: res.devCode || "",
        });
        return;
      }

      goAfterLogin();

    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!twoFactor.code.trim()) {
      setError("Enter your verification code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await verifyTwoFactorLogin({
        tempToken: twoFactor.tempToken,
        code: twoFactor.code.trim(),
      });

      goAfterLogin();

    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h2>Welcome Back</h2>

        <p>{twoFactor.required ? "Enter the verification code sent to your email" : "Login to continue managing your healthcare"}</p>

        {error && <p className="auth-error">{error}</p>}
        {twoFactor.devCode && (
          <p className="auth-message">Development code: {twoFactor.devCode}</p>
        )}

        <div className="login-form">
          {!twoFactor.required ? (
            <>

              <input
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={(e)=>
                  setForm({...form,email:e.target.value})
                }
              />

              <input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e)=>
                  setForm({...form,password:e.target.value})
                }
              />

              <button
                className="login-btn"
                onClick={handleLogin}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </>
          ) : (
            <>
              <input
                inputMode="numeric"
                maxLength="6"
                placeholder="6-digit code"
                value={twoFactor.code}
                onChange={(e) =>
                  setTwoFactor((current) => ({ ...current, code: e.target.value }))
                }
              />

              <button
                className="login-btn"
                onClick={handleVerify}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                className="dev-reset-link"
                onClick={() => setTwoFactor({ required: false, tempToken: "", code: "", devCode: "" })}
              >
                Back to login
              </button>
            </>
          )}

        </div>

        <div className="login-footer">
          <button className="text-link" onClick={() => router.push("/forgot-password")}>
            Forgot password?
          </button>
          <br />
          Do not have an account?{" "}
          <span onClick={()=>router.push("/signup")}>
            Sign Up
          </span>
        </div>

      </div>

    </div>
  );
}
