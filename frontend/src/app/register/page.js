"use client";

import { useState } from "react";
import axios from "axios";
import styles from "../styles.module.css";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields ❌");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          name,
          email,
          password
        }
      );

      setLoading(false);

      alert("Registration successful ✅");
      window.location.href = "/login";

    } catch (err) {
      setLoading(false);
      alert("User already exists ❌");
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
        <h1 className={styles.title}>📝 Create Account</h1>
        <p style={{ opacity: 0.8 }}>
          Join and book healthcare appointments easily
        </p>
      </div>

      {/* Name */}
      <input
        className={styles.input}
        placeholder="👤 Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
      />

      {/* Button */}
      <button className={styles.button} onClick={handleRegister}>
        {loading ? "Creating account..." : "🚀 Register"}
      </button>

      {/* Footer */}
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "#00c6ff" }}>
          Login
        </a>
      </p>
    </motion.div>
  );
}