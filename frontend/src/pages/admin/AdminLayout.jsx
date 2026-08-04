import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Tag,
  Video,
  Layers,
  Share2,
  Calendar,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { API_BASE } from "../../utils/api";
import AdminDashboardOverview from "./AdminDashboardOverview";
import AdminProjects from "./AdminProjects";
import AdminWorkScopes from "./AdminWorkScopes";
import AdminHomepage from "./AdminHomepage";
import AdminBrandReviewCards from "./AdminBrandReviewCards";
import AdminSocials from "./AdminSocials";
import AdminBookings from "./AdminBookings";
import AdminTeamMembers from "./AdminTeamMembers";
import ChangePasswordModal from "./ChangePasswordModal";
import "./AdminLayout.css";

// ─── Toast Notification Component ─────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const Icon =
          t.type === "success"
            ? CheckCircle
            : t.type === "error"
            ? AlertCircle
            : Info;
        return (
          <div
            key={t.id}
            className={`toast-item toast-${t.type} ${t.exiting ? "toast-exit" : ""}`}
          >
            <div className="toast-icon">
              <Icon style={{ width: 16, height: 16 }} />
            </div>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.message && (
                <div className="toast-message">{t.message}</div>
              )}
            </div>
            <button
              className="toast-close"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
            <div className="toast-progress" />
          </div>
        );
      })}
    </div>
  );
}

// ─── Admin Layout Root ──────────────────────────────────────────────────────────
export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState([]);
  const [workScopes, setWorkScopes] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isForcedPasswordChange, setIsForcedPasswordChange] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("paperhoof_admin_token");

  // ── Toast system ────────────────────────────────────────────────────────────
  const showToast = useCallback((type, title, message = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    const savedUser = localStorage.getItem("paperhoof_admin_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.mustChangePassword) {
          setIsForcedPasswordChange(true);
          setIsPasswordModalOpen(true);
        }
      } catch (e) {
        setUser({ name: "Paper Hoof Team", email: "paperhoof@gmail.com", role: "super_admin" });
      }
    }
    fetchProjects();
    fetchWorkScopes();
  }, [token, navigate]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  const fetchWorkScopes = async () => {
    try {
      const res = await fetch(`${API_BASE}/work-scopes`);
      const data = await res.json();
      setWorkScopes(data);
    } catch (err) {
      console.error("Failed to load work scopes:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("paperhoof_admin_token");
    localStorage.removeItem("paperhoof_admin_user");
    navigate("/admin/login");
  };

  const isSuperAdmin = user?.role === "super_admin" || user?.email?.toLowerCase() === "paperhoof@gmail.com";

  const allTabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "workscopes", label: "Work Scope Pills", icon: Tag },
    { id: "homepage", label: "Homepage & Hero", icon: Video },
    { id: "brandreview", label: "Brand Review Cards", icon: Layers },
    { id: "socials", label: "Socials & Contacts", icon: Share2 },
    { id: "bookings", label: "Session Bookings", icon: Calendar },
    { id: "team", label: "Team Members", icon: Users, superAdminOnly: true },
  ];

  const visibleTabs = allTabs.filter((t) => !t.superAdminOnly || isSuperAdmin);

  const activeTabLabel = visibleTabs.find((t) => t.id === activeTab)?.label || "Dashboard";
  const userInitials = (user?.name || "PH")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="admin-layout-wrapper">
      {/* Global Toast Notification System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Password Modal (Forced or Manual) */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        isForced={isForcedPasswordChange}
        onClose={() => {
          if (!isForcedPasswordChange) setIsPasswordModalOpen(false);
        }}
        onSuccess={() => {
          setIsPasswordModalOpen(false);
          setIsForcedPasswordChange(false);
          if (user) {
            setUser({ ...user, mustChangePassword: false });
          }
        }}
        showToast={showToast}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-badge flex items-center gap-2">
            <img
              src="/paperhoof-wordmark.svg"
              alt="Paper Hoof"
              className="sidebar-logo-img filter brightness-0 invert"
              style={{ height: 26, width: "auto" }}
            />
            <span className="text-[10px] font-extrabold tracking-widest text-[#97d9af] uppercase bg-[#123524] px-2 py-0.5 rounded border border-[#97d9af]/30 shadow-sm">
              CMS
            </span>
          </div>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ color: "rgba(151,217,175,0.6)", background: "none", border: "none" }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">Management</div>
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="nav-icon" />
                <span>{tab.label}</span>
                {tab.superAdminOnly && (
                  <span className="tab-super-badge" title="Super Admin Feature">SA</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: User + Actions */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-info-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Paper Hoof Team"}
              </div>
              <div className="user-info-role" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                {isSuperAdmin ? (
                  <span style={{ color: "#97d9af", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 2 }}>
                    <ShieldCheck style={{ width: 12, height: 12 }} /> Super Admin
                  </span>
                ) : (
                  <span>Admin Member</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, width: "100%", marginTop: 8 }}>
            <button
              onClick={() => {
                setIsForcedPasswordChange(false);
                setIsPasswordModalOpen(true);
              }}
              className="logout-btn"
              style={{ flex: 1, justifyContent: "center" }}
              title="Change Password"
            >
              <KeyRound style={{ width: 14, height: 14 }} />
              <span>Password</span>
            </button>

            <button onClick={handleLogout} className="logout-btn" style={{ flex: 1, justifyContent: "center" }}>
              <LogOut style={{ width: 14, height: 14 }} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-container">
        {/* Top Header */}
        <header className="admin-top-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation sidebar"
              className="mobile-menu-btn"
            >
              <Menu style={{ width: 22, height: 22 }} />
            </button>
            <div className="header-breadcrumb">
              <span>Paper Hoof CMS</span>
              <span className="header-breadcrumb-sep">/</span>
              <span className="header-breadcrumb-current">{activeTabLabel}</span>
            </div>
          </div>

          <div className="header-right-actions">
            <div className="header-live-badge">
              <span className="header-live-dot" />
              <span>Live</span>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                fontWeight: 600,
                color: "#123524",
                background: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                borderRadius: 8,
                padding: "6px 14px",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <ExternalLink style={{ width: 13, height: 13 }} />
              <span>View Site</span>
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content-padding">
          {activeTab === "overview" && (
            <AdminDashboardOverview
              projects={projects}
              onNavigateTab={(tabId) => setActiveTab(tabId)}
              onProjectsChange={fetchProjects}
              showToast={showToast}
            />
          )}
          {activeTab === "projects" && (
            <AdminProjects
              projects={projects}
              onProjectsChange={fetchProjects}
              workScopes={workScopes}
              showToast={showToast}
            />
          )}
          {activeTab === "workscopes" && <AdminWorkScopes showToast={showToast} />}
          {activeTab === "homepage" && <AdminHomepage showToast={showToast} />}
          {activeTab === "brandreview" && <AdminBrandReviewCards showToast={showToast} />}
          {activeTab === "socials" && <AdminSocials showToast={showToast} />}
          {activeTab === "bookings" && <AdminBookings showToast={showToast} />}
          {activeTab === "team" && isSuperAdmin && (
            <AdminTeamMembers showToast={showToast} currentUser={user} />
          )}
        </main>
      </div>
    </div>
  );
}
