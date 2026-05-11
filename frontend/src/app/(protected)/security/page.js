"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getTwoFactorSettings,
  updateTwoFactorSettings,
} from "@/services/authService";
import "@/styles/security.css";

export default function SecurityPage() {
  const [settings, setSettings] = useState({ enabled: false, email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

      <section className="security-grid">
        <article className="security-card">
          <h2>Two-factor authentication</h2>
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

        <article className="security-card">
          <h2>Encrypted patient records</h2>
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
