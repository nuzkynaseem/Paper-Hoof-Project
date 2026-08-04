import React, { useState, useEffect } from "react";
import {
  UserPlus,
  ShieldCheck,
  UserCheck,
  Mail,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Key,
  Lock,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function AdminTeamMembers({ showToast, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("admin");
  const [customTempPassword, setCustomTempPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Success result modal
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Delete modal
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("paperhoof_admin_token");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to load team members.");
      }
      setUsers(data);
    } catch (err) {
      setError(err.message);
      showToast("error", "Error Loading Users", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          role: addRole,
          tempPassword: customTempPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to add team member.");
      }

      setCreatedResult(data);
      setIsAddModalOpen(false);
      setAddName("");
      setAddEmail("");
      setAddRole("admin");
      setCustomTempPassword("");
      fetchUsers();
      showToast("success", "Member Added", `Added ${data.user.name} to the team.`);
    } catch (err) {
      showToast("error", "Failed to Add User", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update role.");
      }
      showToast("success", "Role Updated", "Member role has been changed.");
      fetchUsers();
    } catch (err) {
      showToast("error", "Role Update Failed", err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to remove team member.");
      }
      showToast("success", "Member Removed", `Access revoked for ${userToDelete.name}`);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      showToast("error", "Failed to Remove User", err.message);
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showToast("info", "Copied", "Temporary password copied to clipboard.");
  };

  const superAdminCount = users.filter((u) => u.role === "super_admin").length;
  const adminCount = users.filter((u) => u.role !== "super_admin").length;

  return (
    <div className="team-members-container">
      {/* Header Section */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Team Members & Access Control</h2>
          <p className="admin-page-subtitle">
            Manage who can access and edit Paper Hoof CMS backend content.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <UserPlus style={{ width: 16, height: 16 }} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="team-stats-grid">
        <div className="team-stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(151,217,175,0.15)", color: "#97d9af" }}>
            <UserCheck style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Team Members</div>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
            <ShieldCheck style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div className="stat-value">{superAdminCount}</div>
            <div className="stat-label">Super Administrators</div>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            <Mail style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div className="stat-value">{adminCount}</div>
            <div className="stat-label">CMS Members / Editors</div>
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="team-table-card">
        <div className="table-header-title">
          <span>Active Team Accounts</span>
          <button onClick={fetchUsers} className="btn-icon" title="Refresh">
            <RefreshCw style={{ width: 15, height: 15 }} className={loading ? "spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading team members...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No team members found. Add one above!</div>
        ) : (
          <div className="team-table-wrapper">
            <table className="team-table">
              <thead>
                <tr>
                  <th>Member Name & Email</th>
                  <th>Role</th>
                  <th>Added Date</th>
                  <th>Password Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isPrimarySuperAdmin = u.email.toLowerCase() === "paperhoof@gmail.com";
                  const isCurrentLoggedInUser = u.email.toLowerCase() === currentUser?.email?.toLowerCase();

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-table-profile">
                          <div className="user-avatar-circle">
                            {(u.name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name">{u.name}</div>
                            <div className="user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isPrimarySuperAdmin ? (
                          <span className="role-badge role-super-admin">
                            <ShieldCheck style={{ width: 12, height: 12 }} /> Super Admin
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="role-select"
                            disabled={isPrimarySuperAdmin}
                          >
                            <option value="admin">Admin Member</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        )}
                      </td>
                      <td>
                        <span className="date-text">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Initial"}
                        </span>
                      </td>
                      <td>
                        {u.mustChangePassword ? (
                          <span className="pwd-status pwd-temp">
                            <Key style={{ width: 12, height: 12 }} /> Temp Password
                          </span>
                        ) : (
                          <span className="pwd-status pwd-set">
                            <Lock style={{ width: 12, height: 12 }} /> Active
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {!isPrimarySuperAdmin && !isCurrentLoggedInUser ? (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="btn-danger-icon"
                            title="Revoke Access"
                          >
                            <Trash2 style={{ width: 15, height: 15 }} />
                          </button>
                        ) : (
                          <span className="protected-tag">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="modal-header-flex">
              <div>
                <h3 className="modal-title">Add Team Member</h3>
                <p className="modal-subtitle">
                  Provide their details to generate backend CMS credentials.
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-close">
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleAddUser} style={{ marginTop: 16 }}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Gmail / Email Address</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="e.g. alex@gmail.com"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Role Level</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="form-input"
                >
                  <option value="admin">Admin (CMS Content Editing)</option>
                  <option value="super_admin">Super Admin (Full Control + User Mgmt)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">
                  Temporary Password <span style={{ color: "#64748b", fontWeight: 400 }}>(Optional - leave blank for auto-generate)</span>
                </label>
                <input
                  type="text"
                  value={customTempPassword}
                  onChange={(e) => setCustomTempPassword(e.target.value)}
                  placeholder="e.g. PH-custom99"
                  className="form-input"
                />
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Adding Member..." : "Create & Send Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Result Modal with Copyable Temp Password */}
      {createdResult && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="modal-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="success-icon-badge">
                  <Check style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="modal-title">Team Member Created!</h3>
                  <p className="modal-subtitle">{createdResult.user.email}</p>
                </div>
              </div>
              <button onClick={() => setCreatedResult(null)} className="btn-close">
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ marginTop: 20, padding: 16, background: "#0b1510", border: "1.5px solid #97d9af", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: "#97d9af", textTransform: "uppercase", fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>
                Temporary Login Password
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#ffffff", letterSpacing: 2 }}>
                  {createdResult.tempPassword}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdResult.tempPassword)}
                  className="btn-copy"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "#97d9af", color: "#0d1a14", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
              {createdResult.emailSent ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#86efac" }}>
                  <Send style={{ width: 14, height: 14 }} />
                  <span>Invitation email dispatched from paperhoof@gmail.com</span>
                </div>
              ) : (
                <div style={{ color: "#facc15" }}>
                  ℹ️ SMTP email not sent (requires SMTP_PASSWORD in backend/.env). You can copy the temporary password above and share it manually!
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={() => setCreatedResult(null)} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="modal-header-flex">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="danger-icon-badge">
                  <AlertTriangle style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="modal-title">Revoke Team Access</h3>
                  <p className="modal-subtitle">{userToDelete.name} ({userToDelete.email})</p>
                </div>
              </div>
              <button onClick={() => setUserToDelete(null)} className="btn-close">
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <p style={{ fontSize: 14, color: "#cbd5e1", marginTop: 16, lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>{userToDelete.name}</strong> from the Paper Hoof CMS backend team? They will no longer be able to log in.
            </p>

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={() => setUserToDelete(null)} className="btn-secondary" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDeleteUser} className="btn-danger" disabled={deleting}>
                {deleting ? "Removing..." : "Confirm Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
