"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import "../../styles/login.css";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return alert("Please fill all fields");
    }

    try {
      setLoading(true);

      await login(form);

      alert("Login successful");

      router.push("/dashboard");

    } catch (err) {
      alert(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h2>Welcome Back</h2>

        <p>Login to continue managing your healthcare</p>

        <div className="login-form">

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

        </div>

        <div className="login-footer">
          Do not have an account?{" "}
          <span onClick={()=>router.push("/signup")}>
            Sign Up
          </span>
        </div>

      </div>

    </div>
  );
}
