import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Lightbulb,
  Star,
  Image as ImageIcon,
  Video,
  Code2,
  Quote,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { API_BASE } from "../../utils/api";

// Component type config
const COMPONENT_TYPES = [
  { value: "image",  label: "Image",               icon: ImageIcon,   color: "#f0fdf4", iconColor: "#16a34a" },
  { value: "video",  label: "Video",               icon: Video,       color: "#eff6ff", iconColor: "#2563eb" },
  { value: "html",   label: "Interactive HTML",    icon: Code2,       color: "#fef9c3", iconColor: "#b45309" },
  { value: "quote",  label: "Quote / Text Block",  icon: Quote,       color: "#fdf2f8", iconColor: "#9333ea" },
  { value: "grid",   label: "2-Column Image Grid", icon: LayoutGrid,  color: "#fff7ed", iconColor: "#ea580c" },
];

function ComponentTypeIcon({ type, size = 14 }) {
  const cfg = COMPONENT_TYPES.find((c) => c.value === type) || COMPONENT_TYPES[0];
  const Icon = cfg.icon;
  return (
    <span
      style={{ background: cfg.color, color: cfg.iconColor, width: 28, height: 28 }}
      className="rounded-lg flex items-center justify-center shrink-0"
    >
      <Icon style={{ width: size, height: size }} />
    </span>
  );
}

export default function AdminProjects({ projects = [], onProjectsChange, workScopes = [], showToast }) {
  const [editingProject, setEditingProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCompIdx, setUploadingCompIdx] = useState(null);
  const [showPreviewIdx, setShowPreviewIdx] = useState(null);

  const token = localStorage.getItem("paperhoof_admin_token");

  const emptyForm = () => ({
    id: Date.now().toString(),
    name: "",
    category: "",
    tags: [],
    coverImage: "",
    sliderImage: "",
    title: "",
    heroMedia: "",
    heroMediaType: "image",
    subtitle: "",
    description: "",
    readMoreText: "",
    components: [],
    isFeatured: false,
    client: "",
    year: "2026",
    order: projects.length + 1,
  });

  const [formData, setFormData] = useState(emptyForm());

  const handleOpenNew = () => {
    setFormData(emptyForm());
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setFormData({
      id: project.id,
      name: project.name || "",
      category: project.category || "",
      tags: project.tags || [],
      coverImage: project.coverImage || project.image || "",
      sliderImage: project.sliderImage || project.coverImage || project.image || "",
      title: project.title || "",
      heroMedia: project.heroMedia || "",
      heroMediaType: project.heroMediaType || "image",
      subtitle: project.subtitle || "",
      description: project.description || "",
      readMoreText: project.readMoreText || "",
      components: (project.components || []).map((c) => ({
        id: c.id || Date.now().toString(),
        type: c.type || "image",
        contentUrl: c.contentUrl || "",
        quoteText: c.quoteText || "",
        author: c.author || "",
        gridUrls: c.gridUrls || ["", ""],
        insight: c.insight || { title: "", description: "" },
      })),
      isFeatured: project.isFeatured || false,
      client: project.client || "",
      year: project.year || "2026",
      order: project.order || 0,
    });
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleTagToggle = (tagName) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tagName);
      return { ...prev, tags: exists ? prev.tags.filter((t) => t !== tagName) : [...prev.tags, tagName] };
    });
  };

  // ── File Upload Helpers ──────────────────────────────────────────────────────
  const uploadFile = async (file, field, compIndex = null, gridSlot = null) => {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      if (compIndex !== null && gridSlot !== null) {
        // Grid slot upload
        setFormData((prev) => {
          const updated = [...prev.components];
          const urls = [...(updated[compIndex].gridUrls || ["", ""])];
          urls[gridSlot] = data.url;
          updated[compIndex] = { ...updated[compIndex], gridUrls: urls };
          return { ...prev, components: updated };
        });
      } else if (compIndex !== null) {
        setFormData((prev) => {
          const updated = [...prev.components];
          updated[compIndex] = { ...updated[compIndex], contentUrl: data.url };
          return { ...prev, components: updated };
        });
      } else {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
      }
      if (showToast) showToast("success", "File uploaded", file.name);
      return data.url;
    } catch (err) {
      if (showToast) showToast("error", "Upload failed", err.message);
      throw err;
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { await uploadFile(file, field); } finally { setUploading(false); }
  };

  const handleCompFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCompIdx(index);
    try { await uploadFile(file, null, index); } finally { setUploadingCompIdx(null); }
  };

  const handleGridFileUpload = async (e, compIndex, gridSlot) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCompIdx(`${compIndex}-${gridSlot}`);
    try { await uploadFile(file, null, compIndex, gridSlot); } finally { setUploadingCompIdx(null); }
  };

  // ── Component Management ─────────────────────────────────────────────────────
  const handleAddComponent = (type = "image") => {
    const newComp = {
      id: Date.now().toString(),
      type,
      contentUrl: "",
      quoteText: "",
      author: "",
      gridUrls: ["", ""],
      insight: { title: "", description: "" },
    };
    setFormData((prev) => ({ ...prev, components: [...prev.components, newComp] }));
  };

  const handleUpdateComponent = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.components];
      if (field.startsWith("insight.")) {
        const insightField = field.split(".")[1];
        updated[index] = { ...updated[index], insight: { ...(updated[index].insight || {}), [insightField]: value } };
      } else if (field.startsWith("gridUrls.")) {
        const slot = parseInt(field.split(".")[1]);
        const urls = [...(updated[index].gridUrls || ["", ""])];
        urls[slot] = value;
        updated[index] = { ...updated[index], gridUrls: urls };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, components: updated };
    });
  };

  const handleRemoveComponent = (index) => {
    setFormData((prev) => ({ ...prev, components: prev.components.filter((_, i) => i !== index) }));
  };

  const handleMoveComponent = (index, direction) => {
    setFormData((prev) => {
      const updated = [...prev.components];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return { ...prev, components: updated };
    });
  };

  // ── Form Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.coverImage.trim()) {
      if (showToast) showToast("error", "Validation failed", "Please provide a project name and cover image.");
      return;
    }
    setSaving(true);
    try {
      const isNew = !editingProject;
      const url = isNew ? `${API_BASE}/projects` : `${API_BASE}/projects/${formData.id}`;
      const method = isNew ? "POST" : "PUT";

      const payload = {
        ...formData,
        slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
      };

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save project");
      }
      if (showToast) showToast("success", isNew ? "Project created" : "Project updated", `"${formData.name}" was saved successfully.`);
      setModalOpen(false);
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      if (showToast) showToast("error", "Save failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete project");
      if (showToast) showToast("success", "Project deleted", `"${name}" has been removed.`);
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      if (showToast) showToast("error", "Delete failed", err.message);
    }
  };

  // ── Component Editor Card ──────────────────────────────────────────────────
  const renderComponentEditor = (comp, index) => {
    const isUploadingThis = uploadingCompIdx === index;

    return (
      <div key={comp.id || index} style={{ border: "1.5px solid #e5e7eb", borderRadius: 14, background: "#fafafa", padding: "16px 18px" }}>
        {/* Header row */}
        <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
          <div className="flex items-center gap-2">
            <ComponentTypeIcon type={comp.type} />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#123524", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Component #{index + 1}
            </span>
            <span style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
              {COMPONENT_TYPES.find((t) => t.value === comp.type)?.label || comp.type}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleMoveComponent(index, "up")}
              disabled={index === 0}
              style={{ padding: "4px 6px", borderRadius: 7, border: "1px solid #e5e7eb", background: index === 0 ? "#f9fafb" : "#fff", color: index === 0 ? "#d1d5db" : "#374151" }}
              title="Move Up"
            >
              <ChevronUp style={{ width: 13, height: 13 }} />
            </button>
            <button
              type="button"
              onClick={() => handleMoveComponent(index, "down")}
              disabled={index === formData.components.length - 1}
              style={{ padding: "4px 6px", borderRadius: 7, border: "1px solid #e5e7eb", background: index === formData.components.length - 1 ? "#f9fafb" : "#fff", color: index === formData.components.length - 1 ? "#d1d5db" : "#374151" }}
              title="Move Down"
            >
              <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <button
              type="button"
              onClick={() => setShowPreviewIdx(showPreviewIdx === index ? null : index)}
              style={{ padding: "4px 7px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280" }}
              title="Toggle Preview"
            >
              {showPreviewIdx === index ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
            </button>
            <button
              type="button"
              onClick={() => handleRemoveComponent(index)}
              style={{ padding: "4px 7px", borderRadius: 7, border: "1px solid #fecaca", background: "#fff", color: "#dc2626" }}
              title="Remove Component"
            >
              <X style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>

        {/* Type selector */}
        <div className="input-group" style={{ marginBottom: 12 }}>
          <label>Component Type</label>
          <select
            value={comp.type}
            onChange={(e) => handleUpdateComponent(index, "type", e.target.value)}
            className="custom-input"
          >
            {COMPONENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Type-specific fields */}
        {(comp.type === "image" || comp.type === "video") && (
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label>{comp.type === "image" ? "Image URL" : "Video URL"}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={comp.contentUrl}
                onChange={(e) => handleUpdateComponent(index, "contentUrl", e.target.value)}
                placeholder={comp.type === "image" ? "https://domain.com/photo.jpg" : "https://domain.com/video.mp4"}
                className="custom-input flex-1"
              />
              <label
                className="upload-btn"
                style={{ whiteSpace: "nowrap", fontSize: 12 }}
                title={`Upload ${comp.type}`}
              >
                <Upload style={{ width: 13, height: 13 }} />
                <span>{isUploadingThis ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept={comp.type === "image" ? "image/*" : "video/*"}
                  onChange={(e) => handleCompFileUpload(e, index)}
                  className="hidden"
                  disabled={isUploadingThis}
                />
              </label>
            </div>
            {/* Preview thumbnail */}
            {showPreviewIdx === index && comp.contentUrl && (
              <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", maxHeight: 200 }}>
                {comp.type === "video" ? (
                  <video src={comp.contentUrl} controls muted style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
                ) : (
                  <img src={comp.contentUrl} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
                )}
              </div>
            )}
          </div>
        )}

        {comp.type === "html" && (
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label>HTML / Code Snippet</label>
            <textarea
              rows={6}
              value={comp.contentUrl}
              onChange={(e) => handleUpdateComponent(index, "contentUrl", e.target.value)}
              placeholder={"<div class=\"my-component\">\n  <!-- your custom HTML here -->\n</div>"}
              className="custom-input"
              style={{ fontFamily: "monospace", fontSize: 12.5, resize: "vertical" }}
            />
          </div>
        )}

        {comp.type === "quote" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            <div className="input-group">
              <label>Quote / Highlight Text</label>
              <textarea
                rows={3}
                value={comp.quoteText || ""}
                onChange={(e) => handleUpdateComponent(index, "quoteText", e.target.value)}
                placeholder="&ldquo;We crafted a high-impact identity that speaks to both heart and mind.&rdquo;"
                className="custom-input"
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="input-group">
              <label>Author / Attribution (optional)</label>
              <input
                type="text"
                value={comp.author || ""}
                onChange={(e) => handleUpdateComponent(index, "author", e.target.value)}
                placeholder="— Client Name, CEO"
                className="custom-input"
              />
            </div>
          </div>
        )}

        {comp.type === "grid" && (
          <div style={{ marginBottom: 12 }}>
            <label className="input-group">
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                2-Column Image Grid
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginTop: 8 }}>
              {[0, 1].map((slot) => (
                <div key={slot} className="input-group">
                  <label>Column {slot + 1} Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={(comp.gridUrls || ["", ""])[slot] || ""}
                      onChange={(e) => handleUpdateComponent(index, `gridUrls.${slot}`, e.target.value)}
                      placeholder="https://..."
                      className="custom-input flex-1"
                      style={{ fontSize: 12 }}
                    />
                    <label className="upload-btn" style={{ fontSize: 11 }}>
                      <Upload style={{ width: 12, height: 12 }} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleGridFileUpload(e, index, slot)}
                        className="hidden"
                        disabled={uploadingCompIdx === `${index}-${slot}`}
                      />
                    </label>
                  </div>
                  {showPreviewIdx === index && (comp.gridUrls || [])[slot] && (
                    <div style={{ marginTop: 6, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                      <img src={(comp.gridUrls || [])[slot]} alt={`col${slot}`} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Insight Panel */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#92400e", display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <Lightbulb style={{ width: 12, height: 12 }} />
            Optional Insight Caption
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={comp.insight?.title || ""}
              onChange={(e) => handleUpdateComponent(index, "insight.title", e.target.value)}
              placeholder="Insight Title (e.g. Tactile Packaging)"
              className="custom-input"
              style={{ fontSize: 12.5 }}
            />
            <input
              type="text"
              value={comp.insight?.description || ""}
              onChange={(e) => handleUpdateComponent(index, "insight.description", e.target.value)}
              placeholder="Short insight description..."
              className="custom-input"
              style={{ fontSize: 12.5 }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123524]">Project Case Studies</h1>
          <p className="text-sm text-gray-600">
            Add, update, or remove studio projects displayed across the homepage, works catalog, and case study pages.
          </p>
        </div>
        <button onClick={handleOpenNew} className="action-btn-primary px-4 py-2.5">
          <Plus style={{ width: 15, height: 15 }} />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="project-admin-card">
            <div className="project-card-image-wrap">
              <img src={proj.coverImage || proj.image} alt={proj.name} className="w-full h-48 object-cover" />
              {proj.isFeatured && (
                <span className="featured-badge">
                  <Star style={{ width: 11, height: 11, color: "#97d9af", fill: "#97d9af" }} /> Featured
                </span>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase font-bold text-[#166534] tracking-wider">{proj.category || "Project"}</span>
                  <h3 className="text-lg font-bold text-[#123524]">{proj.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(proj)} className="p-1.5 text-gray-500 hover:text-[#123524] transition-colors" title="Edit Project">
                    <Edit2 style={{ width: 15, height: 15 }} />
                  </button>
                  <button onClick={() => handleDelete(proj.id, proj.name)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete Project">
                    <Trash2 style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{proj.subtitle || proj.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(proj.tags || []).map((t, idx) => (
                  <span key={idx} className="tag-pill text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Project Editor Modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-3xl">
            {/* Sticky Header — always visible */}
            <div className="modal-header-sticky">
              <div>
                <h2>{editingProject ? "Edit Project" : "Create New Project"}</h2>
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3, fontWeight: 500 }}>
                  {formData.name || "Untitled Project"}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close modal"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body-scroll">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── 1. Basic Info ─────────────────────────────────────────── */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-wider text-[#166534] font-bold">1. Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="input-group">
                      <label>Project Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Burger Hot"
                        className="custom-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Food Chain"
                        className="custom-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="input-group">
                      <label>Client Name</label>
                      <input
                        type="text"
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        placeholder="e.g. Burger Hot Global"
                        className="custom-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>Year</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="custom-input"
                      >
                        {["2020","2021","2022","2023","2024","2025","2026"].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Work Scope Tags */}
                  <div className="input-group">
                    <label>Work Scope Tags</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {workScopes.map((scope) => {
                        const isSelected = formData.tags.includes(scope.name);
                        return (
                          <button
                            key={scope.id}
                            type="button"
                            onClick={() => handleTagToggle(scope.name)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              isSelected
                                ? "border-[#123524] bg-[#123524] text-white"
                                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
                              style={{ backgroundColor: scope.color }}
                            />
                            {scope.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── 2. Visual Assets ──────────────────────────────────────── */}
                <div className="space-y-4 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <h3 className="text-xs uppercase tracking-wider text-[#166534] font-bold">2. Cover & Showcase Images</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="input-group">
                      <label>Cover Image (Homepage & Works List) *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={formData.coverImage}
                          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                          placeholder="https://domain.com/cover.jpg"
                          className="custom-input flex-1"
                        />
                        <label className="upload-btn">
                          <Upload style={{ width: 13, height: 13 }} />
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "coverImage")} className="hidden" />
                        </label>
                      </div>
                      {formData.coverImage && (
                        <img src={formData.coverImage} alt="cover" style={{ marginTop: 8, borderRadius: 8, height: 80, width: "100%", objectFit: "cover", border: "1px solid #e5e7eb" }} />
                      )}
                    </div>
                    <div className="input-group">
                      <label>Slider Image (Homepage Showcase Slider)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.sliderImage}
                          onChange={(e) => setFormData({ ...formData, sliderImage: e.target.value })}
                          placeholder="https://domain.com/slider.jpg"
                          className="custom-input flex-1"
                        />
                        <label className="upload-btn">
                          <Upload style={{ width: 13, height: 13 }} />
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "sliderImage")} className="hidden" />
                        </label>
                      </div>
                      {formData.sliderImage && (
                        <img src={formData.sliderImage} alt="slider" style={{ marginTop: 8, borderRadius: 8, height: 80, width: "100%", objectFit: "cover", border: "1px solid #e5e7eb" }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* ── 3. Case Study Hero & Narrative ───────────────────────── */}
                <div className="space-y-4 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <h3 className="text-xs uppercase tracking-wider text-[#166534] font-bold">3. Case Study Hero & Narrative</h3>
                  <div className="input-group">
                    <label>Explaining Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Burger Hot — Identity & Ordering System"
                      className="custom-input"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 input-group">
                      <label>Hero Media URL (Image or Video)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.heroMedia}
                          onChange={(e) => setFormData({ ...formData, heroMedia: e.target.value })}
                          placeholder="https://domain.com/hero.mp4"
                          className="custom-input flex-1"
                        />
                        <label className="upload-btn">
                          <Upload style={{ width: 13, height: 13 }} />
                          <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, "heroMedia")} className="hidden" disabled={uploading} />
                        </label>
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Hero Media Type</label>
                      <select
                        value={formData.heroMediaType}
                        onChange={(e) => setFormData({ ...formData, heroMediaType: e.target.value })}
                        className="custom-input"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Subtitle (Lead sentence after hero)</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="A bold rebrand for a fast-casual chain..."
                      className="custom-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Description (Overview paragraph)</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief project overview paragraph..."
                      className="custom-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Read More Expanded Text</label>
                    <textarea
                      rows={3}
                      value={formData.readMoreText}
                      onChange={(e) => setFormData({ ...formData, readMoreText: e.target.value })}
                      placeholder="We crafted a high-impact color system paired with..."
                      className="custom-input"
                    />
                  </div>
                </div>

                {/* ── 4. Case Study Content Components ─────────────────────── */}
                <div className="space-y-4 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-[#166534] font-bold">
                        4. Case Study Content Components
                      </h3>
                      <p className="text-xs text-gray-500" style={{ marginTop: 4 }}>
                        Build rich case study layouts — images, videos, HTML embeds, pull-quotes, and 2-column grids. Reorder freely.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quick-add type picker */}
                      <div className="flex items-center gap-1">
                        {COMPONENT_TYPES.map((ct) => {
                          const Icon = ct.icon;
                          return (
                            <button
                              key={ct.value}
                              type="button"
                              onClick={() => handleAddComponent(ct.value)}
                              title={`Add ${ct.label}`}
                              style={{
                                width: 32, height: 32, borderRadius: 8,
                                border: "1.5px solid #e5e7eb", background: ct.color, color: ct.iconColor,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", transition: "all 0.15s ease",
                              }}
                            >
                              <Icon style={{ width: 14, height: 14 }} />
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddComponent("image")}
                        className="action-btn-secondary py-1.5 px-3 text-xs text-[#123524] bg-gray-100 hover:bg-gray-200 border-gray-200"
                      >
                        <Plus style={{ width: 13, height: 13 }} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {formData.components.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", border: "1.5px dashed #e5e7eb", borderRadius: 12, color: "#9ca3af" }}>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>No components yet.</p>
                      <p style={{ fontSize: 12, marginTop: 4 }}>Click a type button above to add images, videos, quotes, or grid layouts to this case study.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.components.map((comp, index) => renderComponentEditor(comp, index))}
                    </div>
                  )}
                </div>

                {/* ── Options ──────────────────────────────────────────────── */}
                <div className="pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: "#123524" }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#123524" }}>Mark as Featured Project</span>
                      <p style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>Sets this as the highlighted project in the dashboard and hero area.</p>
                    </div>
                  </label>
                </div>

                {/* ── Form Actions ─────────────────────────────────────────── */}
                <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="action-btn-secondary text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="action-btn-primary px-6">
                    {saving ? "Saving..." : editingProject ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
