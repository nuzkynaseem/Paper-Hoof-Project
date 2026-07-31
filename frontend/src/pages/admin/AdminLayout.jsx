import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { API_BASE } from "../../utils/api";
import AdminDashboardOverview from "./AdminDashboardOverview";
import AdminProjects from "./AdminProjects";
import AdminWorkScopes from "./AdminWorkScopes";
import AdminHomepage from "./AdminHomepage";
import AdminBrandReviewCards from "./AdminBrandReviewCards";
import AdminSocials from "./AdminSocials";
import AdminBookings from "./AdminBookings";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState([]);
  const [workScopes, setWorkScopes] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("paperhoof_admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const savedUser = localStorage.getItem("paperhoof_admin_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser({ name: "Paper Hoof Team", email: "admin@paperhoof.com" });
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

  const tabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "workscopes", label: "Work Scope Pills", icon: Tag },
    { id: "homepage", label: "Homepage & Hero", icon: Video },
    { id: "brandreview", label: "Brand Review Cards", icon: Layers },
    { id: "socials", label: "Socials & Contacts", icon: Share2 },
    { id: "bookings", label: "Session Bookings", icon: Calendar },
  ];

  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label || "Dashboard";
  const userInitials = (user?.name || "PH")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="admin-layout-wrapper">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-badge">
            <img
              src="/paperhoof-horse.svg"
              alt="Paper Hoof"
              className="sidebar-logo-img"
            />
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-name">Paper Hoof</div>
              <div className="sidebar-brand-tag">Studio CMS</div>
            </div>
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
          {tabs.map((tab) => {
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
              </button>
            );
          })}
        </nav>

        {/* Footer: User + Logout */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-info-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Paper Hoof Team"}
              </div>
              <div className="user-info-role" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.role === "admin" ? "Administrator" : user?.email || "admin@paperhoof.com"}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut style={{ width: 15, height: 15 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-container">
        {/* Top Header */}
        <header className="admin-top-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: "none",
                color: "#6b7280",
                background: "none",
                border: "none",
                padding: 4,
              }}
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
            />
          )}
          {activeTab === "projects" && (
            <AdminProjects
              projects={projects}
              onProjectsChange={fetchProjects}
              workScopes={workScopes}
            />
          )}
          {activeTab === "workscopes" && <AdminWorkScopes />}
          {activeTab === "homepage" && <AdminHomepage />}
          {activeTab === "brandreview" && <AdminBrandReviewCards />}
          {activeTab === "socials" && <AdminSocials />}
          {activeTab === "bookings" && <AdminBookings />}
        </main>
      </div>
    </div>
  );
}
