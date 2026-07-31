import React, { useState, useEffect } from "react";
import { Star, FolderKanban, Eye, Sparkles, ExternalLink, ArrowRight, CheckCircle, LayoutGrid } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function AdminDashboardOverview({ projects = [], onNavigateTab, onProjectsChange }) {
  const [stats, setStats] = useState({ visitCount: 420, totalProjects: 6, featuredProject: null });
  const [selectedFeaturedId, setSelectedFeaturedId] = useState("");
  const [homepageLimit, setHomepageLimit] = useState(4);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("paperhoof_admin_token");

  useEffect(() => {
    fetchStats();
    fetchHomepageConfig();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/stats`);
      const data = await res.json();
      setStats(data);
      if (data.featuredProject) {
        setSelectedFeaturedId(data.featuredProject.id);
      } else if (projects.length > 0) {
        setSelectedFeaturedId(projects[0].id);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const fetchHomepageConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/site/homepage`);
      if (res.ok) {
        const data = await res.json();
        if (data.homepageProjectsLimit) {
          setHomepageLimit(data.homepageProjectsLimit);
        }
      }
    } catch (err) {
      console.error("Failed to load homepage config:", err);
    }
  };

  const handleSetFeatured = async (e) => {
    const projId = e.target.value;
    setSelectedFeaturedId(projId);
    setSavingFeatured(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/projects/featured/${projId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to set featured project");

      setMessage("Featured project updated!");
      fetchStats();
      if (onProjectsChange) onProjectsChange();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error updating featured project");
    } finally {
      setSavingFeatured(false);
    }
  };

  const handleSetHomepageLimit = async (e) => {
    const limit = parseInt(e.target.value);
    setHomepageLimit(limit);
    setSavingLimit(true);
    setMessage("");

    try {
      const currentRes = await fetch(`${API_BASE}/site/homepage`);
      const currentData = currentRes.ok ? await currentRes.json() : {};

      const res = await fetch(`${API_BASE}/site/homepage`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentData,
          homepageProjectsLimit: limit,
        }),
      });

      if (!res.ok) throw new Error("Failed to update homepage projects limit");

      setMessage(`Homepage now displays ${limit === 100 ? "all" : limit} recent projects!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error updating homepage limit");
    } finally {
      setSavingLimit(false);
    }
  };

  const currentFeatured = projects.find((p) => p.id === selectedFeaturedId) || stats.featuredProject;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="space-y-2">
          <div className="welcome-pill">
            <Sparkles className="w-4 h-4 text-[#97d9af]" />
            <span>Studio Management Hub</span>
          </div>
          <h1 className="welcome-heading">Welcome back, Paper Hoof Team</h1>
          <p className="welcome-subtext">
            Here is an overview of your studio assets, active portfolio, and visitor engagement.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="action-btn-secondary"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Live Site</span>
          </a>
          <button onClick={() => onNavigateTab("projects")} className="action-btn-primary">
            <FolderKanban className="w-4 h-4" />
            <span>Manage Projects</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Projects Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper bg-[#f0fdf4] text-[#166534]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span className="stat-badge">Active Portfolio</span>
          </div>
          <div className="stat-value">{projects.length || stats.totalProjects}</div>
          <div className="stat-footer">
            <span>Published studio projects</span>
            <button onClick={() => onNavigateTab("projects")} className="stat-link">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Website Visits Card */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper bg-blue-50 text-blue-700">
              <Eye className="w-5 h-5" />
            </div>
            <span className="stat-badge text-blue-700 border-blue-200 bg-blue-50">Live Engagement</span>
          </div>
          <div className="stat-value">{stats.visitCount.toLocaleString()}</div>
          <div className="stat-footer">
            <span>Total website visits recorded</span>
          </div>
        </div>

        {/* Featured Project Status */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper bg-amber-50 text-amber-700">
              <Star className="w-5 h-5" />
            </div>
            <span className="stat-badge text-amber-700 border-amber-200 bg-amber-50">Spotlight</span>
          </div>
          <div className="stat-title truncate">
            {currentFeatured ? currentFeatured.name : "No Featured Project"}
          </div>
          <div className="stat-footer">
            <span>Currently showcased on Hero</span>
          </div>
        </div>
      </div>

      {/* Controls Row: Featured Project & Homepage Display Limit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Project Interactive Selector Card */}
        <div className="featured-selector-card lg:col-span-2">
          <div className="featured-card-header">
            <div className="flex items-center gap-3">
              <div className="featured-star-badge">
                <Star className="w-5 h-5 text-amber-600 fill-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#123524]">Featured Project Showcase</h2>
                <p className="text-sm text-gray-600">
                  Select which project takes center stage across the website hero showcase
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {message && (
                <span className="flex items-center gap-1.5 text-xs text-[#166534] bg-[#f0fdf4] px-3 py-1.5 rounded-full border border-[#bbf7d0] font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {message}
                </span>
              )}
              <select
                value={selectedFeaturedId}
                onChange={handleSetFeatured}
                disabled={savingFeatured}
                className="featured-select-input"
              >
                <option value="" disabled>
                  Select a project...
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category || "Project"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentFeatured && (
            <div className="featured-preview-grid">
              <div className="featured-image-wrapper">
                <img
                  src={currentFeatured.coverImage || currentFeatured.image}
                  alt={currentFeatured.name}
                  className="featured-image"
                />
                <span className="featured-tag">Current Spotlight</span>
              </div>
              <div className="space-y-3 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-wider text-[#166534] font-bold">
                  {currentFeatured.category}
                </span>
                <h3 className="text-2xl font-bold text-[#123524]">{currentFeatured.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {currentFeatured.subtitle || currentFeatured.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(currentFeatured.tags || []).map((t, idx) => (
                    <span key={idx} className="tag-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Homepage Listed Projects Count Config Card */}
        <div className="editor-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#123524]">Homepage Projects Count</h2>
                <p className="text-xs text-gray-500">
                  Number of additional works to show on homepage
                </p>
              </div>
            </div>

            <div className="input-group pt-2">
              <label>Homepage Works Limit</label>
              <select
                value={homepageLimit}
                onChange={handleSetHomepageLimit}
                disabled={savingLimit}
                className="custom-input font-medium"
              >
                <option value={2}>Show 2 Projects</option>
                <option value={4}>Show 4 Projects (Default)</option>
                <option value={6}>Show 6 Projects</option>
                <option value={8}>Show 8 Projects</option>
                <option value={100}>Show All Projects</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f9fafb] border border-gray-200 space-y-1 text-xs text-gray-600">
            <div className="font-bold text-[#123524]">Live Config Summary:</div>
            <p>
              • 1 Featured Project in Hero Spotlight<br />
              • {homepageLimit === 100 ? "All" : homepageLimit} Recent Projects in grid below
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
