import React, { useState, useEffect } from "react";
import { Tag, Plus, Trash2, Palette } from "lucide-react";
import { API_BASE } from "../../utils/api";

const SECONDARY_PALETTE = [
  { name: "Mint Sprig", hex: "#97D9AF" },
  { name: "Phthalo Green", hex: "#123524" },
  { name: "Midnight Harbor", hex: "#1E293B" },
  { name: "Golden Straw", hex: "#EAB308" },
  { name: "Bubblegum Bloom", hex: "#F472B6" },
  { name: "Birch Mist", hex: "#F5F5F5" },
  { name: "Dark Soot", hex: "#222220" },
  { name: "Barn Red", hex: "#D92B24" },
];

export default function AdminWorkScopes({ showToast }) {
  const [scopes, setScopes] = useState([]);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#97D9AF");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("paperhoof_admin_token");

  useEffect(() => {
    fetchWorkScopes();
  }, []);

  const fetchWorkScopes = async () => {
    try {
      const res = await fetch(`${API_BASE}/work-scopes`);
      const data = await res.json();
      setScopes(data);
    } catch (err) {
      console.error("Failed to fetch work scopes:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/work-scopes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName.toUpperCase().trim(),
          color: selectedColor,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to create work scope pill");
      }
      setNewName("");
      if (showToast) showToast("success", "Pill created", `"${newName.toUpperCase().trim()}" added to work scopes.`);
      fetchWorkScopes();
    } catch (err) {
      if (showToast) showToast("error", "Create failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/work-scopes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete pill");
      if (showToast) showToast("success", "Pill deleted", `"${name}" was removed.`);
      fetchWorkScopes();
    } catch (err) {
      if (showToast) showToast("error", "Delete failed", err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#123524]">Work Scope Pills</h1>
        <p className="text-sm text-gray-600">
          Create or delete discipline tags shown on project covers and case study overviews. Assign a secondary accent color per pill.
        </p>
      </div>

      {/* Create Form Card */}
      <div className="editor-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
            <Tag style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#123524]">Create New Work Scope Pill</h2>
            <p className="text-xs text-gray-500">Specify pill title and secondary accent color</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <label>Pill Name (e.g. BRANDING, IDENTITY)</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="DIGITAL PRESENCE"
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label>Secondary Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid #d1d5db", background: "transparent", padding: 0, cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="custom-input flex-1 font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Preset Color Swatches */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600 flex items-center gap-1 font-bold">
              <Palette style={{ width: 13, height: 13 }} />
              <span>Select from Studio Secondary Palette:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SECONDARY_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedColor.toLowerCase() === c.hex.toLowerCase()
                      ? "border-[#123524] bg-[#123524] text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <span
                    style={{ backgroundColor: c.hex, width: 14, height: 14, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)", display: "inline-block", flexShrink: 0 }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newName.trim()}
            className="action-btn-primary px-6 py-2.5 mt-2"
          >
            <Plus style={{ width: 15, height: 15 }} />
            <span>{loading ? "Creating..." : "Add Work Scope Pill"}</span>
          </button>
        </form>
      </div>

      {/* Active Scope Pills List */}
      <div className="editor-card">
        <h2 className="text-lg font-bold text-[#123524] mb-4">Active Work Scope Pills ({scopes.length})</h2>
        {scopes.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 font-medium">No work scope pills found. Create your first pill above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {scopes.map((scope) => (
              <div
                key={scope.id}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: 12, background: "#f9fafb", border: "1px solid #e5e7eb", transition: "all 0.2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)", background: scope.color, display: "inline-block", flexShrink: 0 }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", color: "#123524" }}>{scope.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(scope.id, scope.name)}
                  style={{ padding: "6px", color: "#9ca3af", borderRadius: 6, background: "none", border: "none", transition: "color 0.15s" }}
                  title="Delete Pill"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                >
                  <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
