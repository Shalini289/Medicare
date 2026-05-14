"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/authService";
import "../../styles/signup.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSignup = (values) => {
  const nextErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) {
    nextErrors.name = "Full name is required.";
  } else if (name.length < 2) {
    nextErrors.name = "Name must be at least 2 characters.";
  } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    nextErrors.name = "Name can only include letters, spaces, dots, apostrophes, or hyphens.";
  }

  if (!email) {
    nextErrors.email = "Email address is required.";
  } else if (!emailPattern.test(email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    nextErrors.password = "Password is required.";
  } else if (values.password.length < 8) {
    nextErrors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(values.password)) {
    nextErrors.password = "Add at least one uppercase letter.";
  } else if (!/[a-z]/.test(values.password)) {
    nextErrors.password = "Add at least one lowercase letter.";
  } else if (!/[0-9]/.test(values.password)) {
    nextErrors.password = "Add at least one number.";
  }

  if (!values.confirmPassword) {
    nextErrors.confirmPassword = "Please confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    nextErrors.confirmPassword = "Passwords do not match.";
  }

  if (values.role === "doctor" && !values.specialization.trim()) {
    nextErrors.specialization = "Specialization is required for doctor accounts.";
  }

  if (values.role === "hospital") {
    if (!values.hospitalName.trim()) {
      nextErrors.hospitalName = "Hospital name is required.";
    }

    if (!values.city.trim()) {
      nextErrors.city = "City is required for hospital accounts.";
    }
  }

  return nextErrors;
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    specialization: "",
    hospital: "",
    experience: "",
    fees: "",
    hospitalName: "",
    city: "",
    address: "",
    phone: "",
    emergencyPhone: "",
    ICU: "",
    oxygen: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setServerError("");

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    const nextErrors = validateSignup(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);
      setServerError("");

      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        specialization: form.specialization.trim(),
        hospital: form.hospital.trim(),
        experience: form.experience,
        fees: form.fees,
        hospitalName: form.hospitalName.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        emergencyPhone: form.emergencyPhone.trim(),
        ICU: form.ICU,
        oxygen: form.oxygen,
        general: form.general,
      });

      router.push("/login");

    } catch (err) {
      setServerError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        <h2>Create Account</h2>

        <p>Join MediCare and manage your healthcare easily</p>

        {serverError && <div className="signup-alert">{serverError}</div>}

        <form className="signup-form" onSubmit={handleSignup} noValidate>
          <label className="signup-field">
            <span>Full Name</span>
            <input
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              onChange={(e) => updateField("name", e.target.value)}
              onBlur={() =>
                setErrors((current) => ({
                  ...current,
                  name: validateSignup(form).name || "",
                }))
              }
            />
            {errors.name && <small>{errors.name}</small>}
          </label>

          <label className="signup-field">
            <span>Email Address</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              onChange={(e) => updateField("email", e.target.value)}
              onBlur={() =>
                setErrors((current) => ({
                  ...current,
                  email: validateSignup(form).email || "",
                }))
              }
            />
            {errors.email && <small>{errors.email}</small>}
          </label>

          <label className="signup-field">
            <span>Account Type</span>
            <select
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
            >
              <option value="user">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="pathology">Pathology</option>
              <option value="hospital">Hospital</option>
            </select>
          </label>

          {form.role === "doctor" && (
            <div className="doctor-signup-fields">
              <label className="signup-field">
                <span>Specialization</span>
                <input
                  type="text"
                  placeholder="Cardiology, Dermatology, General Physician..."
                  value={form.specialization}
                  aria-invalid={Boolean(errors.specialization)}
                  onChange={(e) => updateField("specialization", e.target.value)}
                  onBlur={() =>
                    setErrors((current) => ({
                      ...current,
                      specialization: validateSignup(form).specialization || "",
                    }))
                  }
                />
                {errors.specialization && <small>{errors.specialization}</small>}
              </label>

              <label className="signup-field">
                <span>Hospital or Clinic</span>
                <input
                  type="text"
                  placeholder="Clinic or hospital name"
                  value={form.hospital}
                  onChange={(e) => updateField("hospital", e.target.value)}
                />
              </label>

              <label className="signup-field">
                <span>City</span>
                <input
                  type="text"
                  placeholder="City for patient searches"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </label>

              <div className="signup-field-grid">
                <label className="signup-field">
                  <span>Experience</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Years"
                    value={form.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                  />
                </label>

                <label className="signup-field">
                  <span>Fees</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Consultation fee"
                    value={form.fees}
                    onChange={(e) => updateField("fees", e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {form.role === "hospital" && (
            <div className="doctor-signup-fields">
              <label className="signup-field">
                <span>Hospital Name</span>
                <input
                  type="text"
                  placeholder="Hospital or medical center name"
                  value={form.hospitalName}
                  aria-invalid={Boolean(errors.hospitalName)}
                  onChange={(e) => updateField("hospitalName", e.target.value)}
                />
                {errors.hospitalName && <small>{errors.hospitalName}</small>}
              </label>

              <div className="signup-field-grid">
                <label className="signup-field">
                  <span>City</span>
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    aria-invalid={Boolean(errors.city)}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                  {errors.city && <small>{errors.city}</small>}
                </label>

                <label className="signup-field">
                  <span>Phone</span>
                  <input
                    type="tel"
                    placeholder="Reception phone"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </label>
              </div>

              <label className="signup-field">
                <span>Address</span>
                <input
                  type="text"
                  placeholder="Hospital address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </label>

              <label className="signup-field">
                <span>Emergency Phone</span>
                <input
                  type="tel"
                  placeholder="Emergency contact number"
                  value={form.emergencyPhone}
                  onChange={(e) => updateField("emergencyPhone", e.target.value)}
                />
              </label>

              <div className="signup-field-grid">
                <label className="signup-field">
                  <span>ICU Beds</span>
                  <input type="number" min="0" value={form.ICU} onChange={(e) => updateField("ICU", e.target.value)} />
                </label>
                <label className="signup-field">
                  <span>Oxygen Beds</span>
                  <input type="number" min="0" value={form.oxygen} onChange={(e) => updateField("oxygen", e.target.value)} />
                </label>
                <label className="signup-field">
                  <span>General Beds</span>
                  <input type="number" min="0" value={form.general} onChange={(e) => updateField("general", e.target.value)} />
                </label>
              </div>
            </div>
          )}

          <label className="signup-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              onChange={(e) => updateField("password", e.target.value)}
              onBlur={() =>
                setErrors((current) => ({
                  ...current,
                  ...validateSignup(form),
                }))
              }
            />
            {errors.password && <small>{errors.password}</small>}
          </label>

          <label className="signup-field">
            <span>Confirm Password</span>
            <input
              type="password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              onBlur={() =>
                setErrors((current) => ({
                  ...current,
                  confirmPassword: validateSignup(form).confirmPassword || "",
                }))
              }
            />
            {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
          </label>

          <ul className="password-rules" aria-label="Password requirements">
            <li className={form.password.length >= 8 ? "met" : ""}>8+ characters</li>
            <li className={/[A-Z]/.test(form.password) ? "met" : ""}>Uppercase letter</li>
            <li className={/[a-z]/.test(form.password) ? "met" : ""}>Lowercase letter</li>
            <li className={/[0-9]/.test(form.password) ? "met" : ""}>Number</li>
          </ul>

          <button
            className="signup-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </form>

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
