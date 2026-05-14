"use client";

import { useCallback, useEffect, useState } from "react";
import { FaKey, FaLock, FaShieldAlt, FaUserLock } from "react-icons/fa";
import {
  changePassword,
  getTwoFactorSettings,
  updateTwoFactorSettings,
} from "@/services/authService";
import "@/styles/security.css";

const passwordChecks = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "Uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "Number", test: (value) => /[0-9]/.test(value) },
];

export default function SecurityPage() {
  const [settings, setSettings] = useState({ enabled: false, email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTwoFactorSettings();
      setSettings(data);
    } catch (err) {
      setError(err.message || "Could not load security settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadSettings();
    });
  }, [loadSettings]);

  const toggleTwoFactor = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const next = !settings.enabled;
      const data = await updateTwoFactorSettings(next);
      setSettings((current) => ({ ...current, enabled: data.enabled }));
      setMessage(next ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
    } catch (err) {
      setError(err.message || "Could not update two-factor authentication");
    } finally {
      setSaving(false);
    }
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    const invalidRule = passwordChecks.find((rule) => !rule.test(passwordForm.newPassword));

    if (invalidRule) {
      setError("New password must meet all password requirements.");
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage(res.msg || "Password changed successfully.");
    } catch (err) {
      setError(err.message || "Could not change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <main className="security-page">
      <section className="security-hero">
        <div>
          <span className="eyebrow">Account protection</span>
          <h1>Security Settings</h1>
          <p>Protect sign-ins with a one-time verification code and keep patient records encrypted at rest.</p>
        </div>
      </section>

      {error && <p className="security-alert error">{error}</p>}
      {message && <p className="security-alert success">{message}</p>}

      <section className="security-status">
        <article>
          <FaShieldAlt aria-hidden="true" />
          <span>Sign-in protection</span>
          <strong>{settings.enabled ? "Strong" : "Basic"}</strong>
        </article>
        <article>
          <FaLock aria-hidden="true" />
          <span>Patient records</span>
          <strong>Encrypted</strong>
        </article>
        <article>
          <FaKey aria-hidden="true" />
          <span>Password policy</span>
          <strong>Strong</strong>
        </article>
      </section>

      <section className="security-grid">
        <article className="security-card">
          <div className="security-card__title">
            <FaUserLock aria-hidden="true" />
            <h2>Two-factor authentication</h2>
          </div>
          <p>When enabled, login requires your password and a 6-digit email verification code.</p>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>{settings.email || "Not available"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{settings.enabled ? "Enabled" : "Disabled"}</dd>
            </div>
          </dl>
          <button className="btn-primary" onClick={toggleTwoFactor} disabled={loading || saving}>
            {saving ? "Saving..." : settings.enabled ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </article>

        <form className="security-card security-form" onSubmit={submitPassword}>
          <div className="security-card__title">
            <FaKey aria-hidden="true" />
            <h2>Change password</h2>
          </div>
          <p>Use a new password that is not shared with another account.</p>

          <label>
            Current password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => updatePasswordField("currentPassword", event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => updatePasswordField("newPassword", event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <ul className="security-rules">
            {passwordChecks.map((rule) => (
              <li className={rule.test(passwordForm.newPassword) ? "met" : ""} key={rule.label}>
                {rule.label}
              </li>
            ))}
          </ul>

          <button className="btn-primary" type="submit" disabled={passwordSaving}>
            {passwordSaving ? "Changing..." : "Change password"}
          </button>
        </form>

        <article className="security-card">
          <div className="security-card__title">
            <FaLock aria-hidden="true" />
            <h2>Encrypted patient records</h2>
          </div>
          <p>Sensitive medical profile fields are encrypted before storage and decrypted only through authenticated API responses.</p>
          <ul>
            <li>Allergies, conditions, medications</li>
            <li>Medical history notes and attachments</li>
            <li>Emergency contacts, insurance, notes</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
