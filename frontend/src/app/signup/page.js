"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/authService";
import "../../styles/signup.css";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      return alert("Please fill all fields");
    }

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      alert("Signup successful");

      router.push("/login");

    } catch (err) {
      alert(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        <h2>Create Account</h2>

        <p>Join MediCare and manage your healthcare easily</p>

        <div className="signup-form">

          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e)=>
              setForm({...form,name:e.target.value})
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e)=>
              setForm({...form,email:e.target.value})
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e)=>
              setForm({...form,password:e.target.value})
            }
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e)=>
              setForm({...form,confirmPassword:e.target.value})
            }
          />

          <button
            className="signup-btn"
            onClick={handleSignup}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </div>

        <div className="signup-footer">
          Already have an account?{" "}
          <span onClick={()=>router.push("/login")}>
            Login
          </span>
        </div>

      </div>

    </div>
  );
}
