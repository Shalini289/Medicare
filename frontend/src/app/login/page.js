"use client";

import { useState } from "react";
import axios from "axios";
import styles from "../styles.module.css";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password }
      );

      // store token
      localStorage.setItem("token", res.data.token);

      setLoading(false);

      alert("Login successful ✅");

      // redirect
      window.location.href = "/";

    } catch (err) {
      setLoading(false);
      alert("Invalid credentials ❌");
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 className={styles.title}>🔐 Welcome Back</h1>
        <p style={{ opacity: 0.8 }}>
          Login to continue your healthcare journey
        </p>
      </div>

      {/* Email */}
      <input
        className={styles.input}
        type="email"
        placeholder="📧 Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Password */}
      <input
        className={styles.input}
        type="password"
        placeholder="🔑 Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      {/* Button */}
      <button className={styles.button} onClick={handleLogin}>
        {loading ? "Logging in..." : "🚀 Login"}
      </button>

      {/* Footer */}
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Don’t have an account?{" "}
        <a href="/register" style={{ color: "#00c6ff" }}>
          Register
        </a>
      </p>
    </motion.div>
  );
}