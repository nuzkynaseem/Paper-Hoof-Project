import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { API_BASE } from "../../utils/api";
import "./AdminLogin.css";

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed. Please check your credentials.");
      }

      localStorage.setItem("paperhoof_admin_token", data.token);
      localStorage.setItem("paperhoof_admin_user", JSON.stringify(data.user));

      if (onLoginSuccess) onLoginSuccess(data.user);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Left — Brand Panel */}
      <div className="login-brand-panel">
        <div className="login-brand-panel-noise" />

        {/* Decorative Circles */}
        <div className="login-brand-circle login-brand-circle-1" />
        <div className="login-brand-circle login-brand-circle-2" />
        <div className="login-brand-circle login-brand-circle-3" />

        {/* Top: Logo */}
        <div className="login-brand-top">
          <img src="/paperhoof-horse.svg" alt="Paper Hoof Horse" />
          <span className="login-brand-wordmark">Paper Hoof</span>
        </div>

        {/* Bottom: Quote */}
        <div className="login-brand-bottom">
          <p className="login-brand-quote">
            Where <em>clarity</em>, tactile beauty, and strategy meet.
          </p>
          <p className="login-brand-meta">Studio Management Portal · 2026</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="login-form-panel">
        {/* Mobile-only logo */}
        <div className="login-mobile-logo">
          <img src="/paperhoof-logo.svg" alt="Paper Hoof" />
        </div>

        {/* Header */}
        <div className="login-header">
          <span className="login-eyebrow">Team Portal</span>
          <h1 className="login-title">Welcome back,<br />Paper Hoof.</h1>
          <p className="login-subtitle">
            Sign in to manage your studio's content, projects, and bookings.
          </p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="admin-email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@paperhoof.com"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="admin-password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight style={{ width: 17, height: 17 }} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Protected studio portal &nbsp;·&nbsp; <strong>Paper Hoof</strong> © 2026</p>
        </div>
      </div>
    </div>
  );
}
