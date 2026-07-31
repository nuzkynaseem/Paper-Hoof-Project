import React, { useState, useEffect } from "react";
import { Tag, Plus, Trash2, CheckCircle, Palette } from "lucide-react";
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
      const formattedName = newName.toUpperCase().trim();
      const res = await fetch(`${API_BASE}/work-scopes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formattedName,
          color: selectedColor,
        }),
      });

      if (!res.ok) throw new Error("Failed to create work scope pill");

      setNewName("");
      if (showToast) showToast(`Work scope pill "${formattedName}" created successfully!`, "success");
      fetchWorkScopes();
    } catch (err) {
      if (showToast) showToast("Error creating pill: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, pillName) => {
    if (!window.confirm(`Are you sure you want to delete "${pillName}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/work-scopes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete pill");
      if (showToast) showToast(`Work scope pill "${pillName}" deleted`, "success");
      fetchWorkScopes();
    } catch (err) {
      if (showToast) showToast("Error deleting pill: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123524]">Work Scope Pills</h1>
          <p className="text-sm text-gray-600">
            Create or delete discipline tags shown on project covers and case study overviews. Assign a secondary accent color per pill.
          </p>
        </div>
      </div>

      {/* Create Form Card */}
      <div className="editor-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
            <Tag className="w-5 h-5" />
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
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 bg-transparent p-0"
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
              <Palette className="w-3.5 h-3.5" />
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
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  ></span>
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
            <Plus className="w-4 h-4" />
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
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#f9fafb] border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: scope.color }}
                  ></span>
                  <span className="font-bold text-sm tracking-wider text-[#123524]">
                    {scope.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(scope.id, scope.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Pill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
