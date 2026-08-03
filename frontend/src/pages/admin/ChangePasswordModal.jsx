import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound, ShieldAlert } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function ChangePasswordModal({ isOpen, isForced, onClose, onSuccess, showToast }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("paperhoof_admin_token");

    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update password.");
      }

      // Update cached user in localStorage to reflect mustChangePassword: false
      const cachedUser = localStorage.getItem("paperhoof_admin_user");
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          parsed.mustChangePassword = false;
          localStorage.setItem("paperhoof_admin_user", JSON.stringify(parsed));
        } catch (e) {}
      }

      showToast("success", "Password Updated", "Your password has been changed successfully.");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
      showToast("error", "Error Updating Password", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content password-modal">
        <div className="password-modal-header">
          <div className="password-icon-badge">
            {isForced ? <ShieldAlert style={{ width: 22, height: 22, color: "#eab308" }} /> : <KeyRound style={{ width: 22, height: 22, color: "#97d9af" }} />}
          </div>
          <div>
            <h3 className="modal-title">
              {isForced ? "Set Permanent Password" : "Change Account Password"}
            </h3>
            <p className="modal-subtitle">
              {isForced
                ? "You are logged in with a temporary password. Please set your new password to continue."
                : "Update your CMS login credentials."}
            </p>
          </div>
        </div>

        {error && (
          <div className="form-error-alert" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, color: "#f87171", fontSize: 13, margin: "14px 0" }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          {!isForced && (
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Current Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="form-input"
                  style={{ width: "100%", paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                >
                  {showCurrent ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="form-input"
                required
                style={{ width: "100%", paddingRight: 38 }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                {showNew ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="form-input"
              required
            />
          </div>

          <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            {!isForced && (
              <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
