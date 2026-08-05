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
  ArrowLeft,
  Save,
  FolderKanban,
  Check,
  Sparkles,
  Info,
} from "lucide-react";
import { API_BASE, getMediaUrl } from "../../utils/api";

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
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCompIdx, setUploadingCompIdx] = useState(null);
  const [showPreviewIdx, setShowPreviewIdx] = useState(null);
  const [collapsedComps, setCollapsedComps] = useState({});

  const token = localStorage.getItem("paperhoof_admin_token");

  const toggleCollapse = (compId) => {
    setCollapsedComps((prev) => ({ ...prev, [compId]: !prev[compId] }));
  };

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
    setCollapsedComps({});
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        bgColor: c.bgColor || "#123524",
        textColor: c.textColor || "#FFFFFF",
        authorColor: c.authorColor || "#97D9AF",
        quoteFont: c.quoteFont || "heading",
        gridUrls: c.gridUrls || ["", ""],
        insight: c.insight || { title: "", description: "" },
      })),
      isFeatured: project.isFeatured || false,
      client: project.client || "",
      year: project.year || "2026",
      order: project.order || 0,
    });
    setEditingProject(project);
    setCollapsedComps({});
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const newCompId = Date.now().toString();
    const newComp = {
      id: newCompId,
      type,
      contentUrl: "",
      quoteText: "",
      author: "",
      bgColor: "#123524",
      textColor: "#FFFFFF",
      authorColor: "#97D9AF",
      quoteFont: "heading",
      gridUrls: ["", ""],
      insight: { title: "", description: "" },
    };
    setFormData((prev) => ({ ...prev, components: [...prev.components, newComp] }));

    setTimeout(() => {
      const el = document.getElementById(`comp-card-${newCompId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = el.querySelector("input, textarea, select");
        if (focusable) focusable.focus();
      }
    }, 120);
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

  // ── Form Submit & Delete ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      if (showToast) showToast("error", "Validation error", "Project Name is required.");
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
      setIsEditorOpen(false);
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

  // ── Component Editor Card Component ───────────────────────────────────────
  const renderComponentEditor = (comp, index) => {
    const compType = COMPONENT_TYPES.find((c) => c.value === comp.type) || COMPONENT_TYPES[0];
    const isCollapsed = collapsedComps[comp.id];
    const isPreviewing = showPreviewIdx === index;

    return (
      <div
        key={comp.id}
        id={`comp-card-${comp.id}`}
        className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-200"
      >
        {/* Card Header */}
        <div
          className="flex items-center justify-between p-3.5 bg-gray-50 border-b border-gray-200 select-none cursor-pointer"
          onClick={() => toggleCollapse(comp.id)}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 w-5 text-center">#{index + 1}</span>
            <ComponentTypeIcon type={comp.type} />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-800">{compType.label}</span>
              {comp.contentUrl && comp.type !== "quote" && comp.type !== "grid" && (
                <p className="text-[11px] text-gray-500 truncate max-w-xs">{comp.contentUrl}</p>
              )}
              {comp.type === "quote" && comp.quoteText && (
                <p className="text-[11px] text-gray-500 truncate max-w-xs">"{comp.quoteText}"</p>
              )}
              {comp.type === "grid" && comp.gridUrls && (
                <p className="text-[11px] text-gray-500 truncate max-w-xs">{comp.gridUrls.filter(Boolean).length} of 2 slots filled</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowPreviewIdx(isPreviewing ? null : index)}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 border transition-colors ${
                isPreviewing ? "bg-[#123524] text-white border-[#123524]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              title="Toggle Live Component Preview"
            >
              {isPreviewing ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
              <span className="hidden sm:inline">{isPreviewing ? "Hide Preview" : "Preview"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleMoveComponent(index, "up")}
              disabled={index === 0}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Move Up"
            >
              <ChevronUp style={{ width: 14, height: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => handleMoveComponent(index, "down")}
              disabled={index === formData.components.length - 1}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Move Down"
            >
              <ChevronDown style={{ width: 14, height: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => handleRemoveComponent(index)}
              className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
              title="Remove Component"
            >
              <Trash2 style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* Card Body */}
        {!isCollapsed && (
          <div className="p-4 space-y-4 bg-white">
            {/* Type selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="input-group">
                <label style={{ fontSize: 11 }}>Component Type</label>
                <select
                  value={comp.type}
                  onChange={(e) => handleUpdateComponent(index, "type", e.target.value)}
                  className="custom-input text-xs"
                >
                  {COMPONENT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 1: IMAGE */}
            {comp.type === "image" && (
              <div className="space-y-3">
                <div className="input-group">
                  <label style={{ fontSize: 11 }}>Image URL or Direct Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={comp.contentUrl}
                      onChange={(e) => handleUpdateComponent(index, "contentUrl", e.target.value)}
                      placeholder="https://domain.com/showcase.jpg"
                      className="custom-input flex-1 text-xs"
                    />
                    <label className="upload-btn text-xs py-1.5">
                      <Upload style={{ width: 13, height: 13 }} />
                      <span>{uploadingCompIdx === index ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCompFileUpload(e, index)}
                        className="hidden"
                        disabled={uploadingCompIdx === index}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Presentation / Showcase Image Guideline:</strong> Full width recommended 1920px (min width 1400px). Height scales automatically according to graphic aspect ratio.</span>
                </p>
                {comp.contentUrl && (
                  <div className="rounded-lg overflow-hidden border border-gray-200 max-h-44 bg-gray-900 flex items-center justify-center">
                    <img src={getMediaUrl(comp.contentUrl)} alt="preview" className="max-h-44 object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* 2: VIDEO */}
            {comp.type === "video" && (
              <div className="space-y-3">
                <div className="input-group">
                  <label style={{ fontSize: 11 }}>Video URL or Direct Upload (.mp4 / .webm)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={comp.contentUrl}
                      onChange={(e) => handleUpdateComponent(index, "contentUrl", e.target.value)}
                      placeholder="https://domain.com/showcase.mp4"
                      className="custom-input flex-1 text-xs"
                    />
                    <label className="upload-btn text-xs py-1.5">
                      <Upload style={{ width: 13, height: 13 }} />
                      <span>{uploadingCompIdx === index ? "Uploading..." : "Upload Video"}</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleCompFileUpload(e, index)}
                        className="hidden"
                        disabled={uploadingCompIdx === index}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Video Guideline:</strong> 16:9 widescreen format (1920×1080px or 1280×720px) · MP4 (H.264) or WebM under 30MB.</span>
                </p>
                {comp.contentUrl && (
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <video src={getMediaUrl(comp.contentUrl)} controls autoPlay muted loop className="w-full max-h-44 object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* 3: INTERACTIVE HTML / NEXT.JS CODEBLOCK */}
            {comp.type === "html" && (
              <div className="space-y-3">
                <div className="input-group">
                  <label style={{ fontSize: 11 }}>HTML Code or Next.js / React Codeblock</label>
                  <textarea
                    rows={6}
                    value={comp.contentUrl}
                    onChange={(e) => handleUpdateComponent(index, "contentUrl", e.target.value)}
                    placeholder={'<div className="my-widget">Showcase Widget</div> or Next.js codeblock'}
                    className="custom-input font-mono text-xs"
                  />
                  <p className="text-[11px] text-gray-500">
                    Supports HTML embeds or Next.js / React code snippets. Displays as a formatted code window or HTML preview on the live site.
                  </p>
                </div>
              </div>
            )}

            {/* 4: QUOTE / TEXT BLOCK */}
            {comp.type === "quote" && (
              <div className="space-y-3">
                <div className="input-group">
                  <label style={{ fontSize: 11 }}>Quote Statement Text</label>
                  <textarea
                    rows={3}
                    value={comp.quoteText}
                    onChange={(e) => handleUpdateComponent(index, "quoteText", e.target.value)}
                    placeholder="We loved everyone who came across us..."
                    className="custom-input text-xs"
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11 }}>Author Attribution (Optional)</label>
                  <input
                    type="text"
                    value={comp.author}
                    onChange={(e) => handleUpdateComponent(index, "author", e.target.value)}
                    placeholder="— Paper Hoof Design Team"
                    className="custom-input text-xs"
                  />
                </div>
              </div>
            )}

            {/* 5: 2-COLUMN GRID */}
            {comp.type === "grid" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label style={{ fontSize: 11, fontWeight: 700 }} className="text-gray-700 uppercase tracking-wider block">
                    2-Column Image Grid Slots
                  </label>
                </div>
                <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>2-Column Grid Guideline:</strong> Both images should share matching aspect ratios (e.g. 1000×750px or 1:1 square) for perfect side-by-side vertical alignment.</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1].map((slotIdx) => {
                    const slotUrl = (comp.gridUrls || ["", ""])[slotIdx] || "";
                    const isUploadingSlot = uploadingCompIdx === `${index}-${slotIdx}`;
                    return (
                      <div key={slotIdx} className="space-y-2 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                        <span className="text-[11px] font-bold text-gray-600 block">Image #{slotIdx + 1}</span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={slotUrl}
                            onChange={(e) => handleUpdateComponent(index, `gridUrls.${slotIdx}`, e.target.value)}
                            placeholder="Image URL"
                            className="custom-input flex-1 text-xs"
                          />
                          <label className="upload-btn text-xs py-1 px-2.5 shrink-0">
                            <Upload style={{ width: 12, height: 12 }} />
                            <span>{isUploadingSlot ? "..." : "Upload"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGridFileUpload(e, index, slotIdx)}
                              className="hidden"
                              disabled={isUploadingSlot}
                            />
                          </label>
                        </div>
                        {slotUrl && (
                          <img src={getMediaUrl(slotUrl)} alt={`slot-${slotIdx}`} className="w-full h-24 object-cover rounded border border-gray-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Insight Caption */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                <Lightbulb style={{ width: 13, height: 13, color: "#166534" }} />
                <span>Bottom-Left Interactive Insight Button (Optional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={comp.insight?.title || ""}
                  onChange={(e) => handleUpdateComponent(index, "insight.title", e.target.value)}
                  placeholder="Insight Title (e.g. Tactile Packaging)"
                  className="custom-input text-xs"
                />
                <input
                  type="text"
                  value={comp.insight?.description || ""}
                  onChange={(e) => handleUpdateComponent(index, "insight.description", e.target.value)}
                  placeholder="Short insight description..."
                  className="custom-input text-xs"
                />
              </div>
            </div>

            {/* Live Component Preview */}
            {isPreviewing && (
              <div className="mt-3 p-4 bg-neutral-900 rounded-xl text-white space-y-2 border border-neutral-700">
                <span className="text-[10px] font-bold text-[#97D9AF] uppercase tracking-wider block">Live Component Preview</span>
                {comp.type === "image" && comp.contentUrl && (
                  <img src={getMediaUrl(comp.contentUrl)} alt="preview" className="w-full max-h-60 object-cover rounded-lg" />
                )}
                {comp.type === "video" && comp.contentUrl && (
                  <video src={getMediaUrl(comp.contentUrl)} controls autoPlay muted loop className="w-full max-h-60 object-cover rounded-lg" />
                )}
                {comp.type === "quote" && (
                  <div className="p-6 bg-[#123524] rounded-xl text-center">
                    <blockquote className="text-lg font-serif">"{comp.quoteText || "Quote Text..."}"</blockquote>
                    {comp.author && <cite className="text-xs text-[#97D9AF] font-bold mt-2 block">— {comp.author}</cite>}
                  </div>
                )}
                {comp.type === "grid" && (
                  <div className="grid grid-cols-2 gap-2">
                    {(comp.gridUrls || ["", ""]).map((u, idx) => (
                      u ? <img key={idx} src={getMediaUrl(u)} alt="grid" className="w-full h-32 object-cover rounded" /> : <div key={idx} className="h-32 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-500">Empty Slot</div>
                    ))}
                  </div>
                )}
                {comp.type === "html" && (
                  <div className="p-3 bg-neutral-950 font-mono text-xs text-emerald-400 rounded overflow-x-auto whitespace-pre">
                    {comp.contentUrl || "<!-- HTML or Next.js Codeblock -->"}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── 1: FULL SCREEN EDITOR VIEW WITH BREADCRUMBS ──────────────────────────────
  if (isEditorOpen) {
    return (
      <div className="space-y-8 max-w-6xl pb-20">
        {/* Breadcrumbs & Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e5e5e0]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="hover:text-[#123524] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FolderKanban style={{ width: 14, height: 14 }} />
                <span>Projects</span>
              </button>
              <span>/</span>
              <span className="font-bold text-[#123524]">
                {editingProject ? `Edit: ${formData.name || "Untitled Project"}` : "Create New Project"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#123524]">
              {editingProject ? `Editing Project "${formData.name || ""}"` : "Create New Project Case Study"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="action-btn-secondary px-4 py-2.5 cursor-pointer"
            >
              <ArrowLeft style={{ width: 15, height: 15 }} />
              <span>Back to Projects</span>
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="action-btn-primary px-6 py-2.5 cursor-pointer"
            >
              <Save style={{ width: 15, height: 15 }} />
              <span>{saving ? "Saving Changes..." : editingProject ? "Save Changes" : "Create Project"}</span>
            </button>
          </div>
        </div>

        {/* Full Page Editor Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── 1. Basic Project Information ───────────────────────────────── */}
          <div className="editor-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#123524] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#f0fdf4] text-[#166534] text-xs flex items-center justify-center font-extrabold">1</span>
                <span>Basic Project Information</span>
              </h2>
              <label className="flex items-center gap-2.5 cursor-pointer bg-[#f9fafb] px-3.5 py-1.5 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#123524] cursor-pointer"
                />
                <span className="text-xs font-bold text-[#123524] flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Featured Spotlight
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="input-group lg:col-span-2">
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
                  placeholder="e.g. Brand Identity & Web"
                  className="custom-input"
                />
              </div>
              <div className="input-group">
                <label>Client & Year</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Client Name"
                    className="custom-input text-xs"
                  />
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="Year"
                    className="custom-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Work Scope Pills / Tags */}
            <div className="input-group">
              <label>Work Scope Pills (Tags)</label>
              <div className="flex flex-wrap gap-2 p-3 bg-[#f9fafb] border border-gray-200 rounded-xl">
                {workScopes.map((scope) => {
                  const selected = formData.tags.includes(scope.name);
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => handleTagToggle(scope.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        selected
                          ? "bg-[#123524] text-white border-[#123524] shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#123524]"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {scope.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 2. Cover & Showcase Images ──────────────────────────────────── */}
          <div className="editor-card space-y-6">
            <div className="pb-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#123524] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#f0fdf4] text-[#166534] text-xs flex items-center justify-center font-extrabold">2</span>
                <span>Cover & Showcase Media</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="input-group space-y-2">
                <label>Cover Image URL (Featured Grid)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://domain.com/cover.jpg"
                    className="custom-input flex-1"
                  />
                  <label className="upload-btn">
                    <Upload style={{ width: 14, height: 14 }} />
                    <span>{uploading ? "..." : "Upload"}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "coverImage")} className="hidden" disabled={uploading} />
                  </label>
                </div>
                <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Recommended:</strong> 16:9 ratio · 1920×1080px (min width 1200px) · JPG/PNG/WebP under 5MB.</span>
                </p>
                {formData.coverImage && (
                  <img src={getMediaUrl(formData.coverImage)} alt="cover" className="w-full h-36 object-cover rounded-xl border border-gray-200" />
                )}
              </div>

              <div className="input-group space-y-2">
                <label>Slider / Dock Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.sliderImage}
                    onChange={(e) => setFormData({ ...formData, sliderImage: e.target.value })}
                    placeholder="https://domain.com/slider.jpg"
                    className="custom-input flex-1"
                  />
                  <label className="upload-btn">
                    <Upload style={{ width: 14, height: 14 }} />
                    <span>{uploading ? "..." : "Upload"}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "sliderImage")} className="hidden" disabled={uploading} />
                  </label>
                </div>
                <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Recommended:</strong> 4:3 portrait or 16:9 ratio (1200×1200px or 1600×1200px) · Appears in bottom dock.</span>
                </p>
                {formData.sliderImage && (
                  <img src={getMediaUrl(formData.sliderImage)} alt="slider" className="w-full h-36 object-cover rounded-xl border border-gray-200" />
                )}
              </div>
            </div>
          </div>

          {/* ── 3. Case Study Hero & Narrative ──────────────────────────────── */}
          <div className="editor-card space-y-6">
            <div className="pb-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#123524] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#f0fdf4] text-[#166534] text-xs flex items-center justify-center font-extrabold">3</span>
                <span>Case Study Hero & Narrative</span>
              </h2>
            </div>

            <div className="space-y-4">
              <div className="input-group">
                <label>Explaining Title (Top Heading in Case Study)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Burger Hot — Identity & Ordering System"
                  className="custom-input"
                />
              </div>

              <div className="space-y-2">
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
                        <Upload style={{ width: 14, height: 14 }} />
                        <span>{uploading ? "..." : "Upload"}</span>
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
                      <option value="video">Video (.mp4)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Recommended Hero Guidelines:</strong> {formData.heroMediaType === 'video' ? '16:9 widescreen 1080p MP4 (H.264) · Muted autoplay background under 25MB.' : 'Width 1920px (16:9 or 21:9 ultra-wide banner) · Height scales automatically.'}</span>
                </p>
              </div>

              <div className="input-group">
                <label>Subtitle (Visible when Read More is NOT pressed)</label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Burger Hot is a fast-casual dining experience built for modern taste..."
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label>Description Paragraph (Revealed when Read More IS pressed)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="The new visual identity balances warmth with high-contrast typography..."
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label>Additional Narrative Text (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.readMoreText}
                  onChange={(e) => setFormData({ ...formData, readMoreText: e.target.value })}
                  placeholder="We crafted a high-impact color system paired with..."
                  className="custom-input"
                />
              </div>
            </div>
          </div>

          {/* ── 4. Case Study Content Components ────────────────────────────── */}
          <div className="editor-card space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-[#123524] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#f0fdf4] text-[#166534] text-xs flex items-center justify-center font-extrabold">4</span>
                  <span>Case Study Content Components</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Build rich case study layouts — images, videos, HTML embeds, Next.js codeblocks, pull-quotes, and 2-column grids.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                  {COMPONENT_TYPES.map((ct) => {
                    const Icon = ct.icon;
                    return (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => handleAddComponent(ct.value)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-white text-gray-800 border border-gray-200 hover:border-[#123524] hover:text-[#123524] shadow-sm transition-all cursor-pointer"
                      >
                        <Icon style={{ width: 13, height: 13, color: ct.iconColor }} />
                        <span>+ {ct.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {formData.components.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-gray-200 rounded-xl text-center space-y-3 bg-[#f9fafb]">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#123524]">No Components Added Yet</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Click any button above to add full-width images, videos, Next.js codeblocks, pull-quotes, or 2-column grids.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.components.map((comp, index) => renderComponentEditor(comp, index))}
              </div>
            )}
          </div>

          {/* Sticky Bottom Save Bar */}
          <div className="sticky bottom-4 z-40 bg-[#123524] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-[#97d9af]/30">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#97d9af] animate-pulse" />
              <span className="text-sm font-bold">
                {editingProject ? `Editing "${formData.name || "Project"}"` : "Creating New Project"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#97d9af] text-[#123524] hover:bg-[#7dce9b] transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Save style={{ width: 14, height: 14 }} />
                <span>{saving ? "Saving..." : "Save Project"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── 2: MAIN PROJECTS CATALOG LIST VIEW ──────────────────────────────────────
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
        <button onClick={handleOpenNew} className="action-btn-primary px-4 py-2.5 cursor-pointer">
          <Plus style={{ width: 15, height: 15 }} />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="project-admin-card cursor-pointer">
            <div className="project-card-image-wrap" onClick={() => handleOpenEdit(proj)}>
              <img src={getMediaUrl(proj.coverImage || proj.image)} alt={proj.name} className="w-full h-48 object-cover" />
              {proj.isFeatured && (
                <span className="featured-badge">
                  <Star style={{ width: 11, height: 11, color: "#97d9af", fill: "#97d9af" }} /> Featured
                </span>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div onClick={() => handleOpenEdit(proj)} className="cursor-pointer">
                  <span className="text-xs uppercase font-bold text-[#166534] tracking-wider">{proj.category || "Project"}</span>
                  <h3 className="text-lg font-bold text-[#123524] hover:text-[#166534] transition-colors">{proj.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(proj)} className="p-1.5 text-gray-500 hover:text-[#123524] transition-colors cursor-pointer" title="Edit Project">
                    <Edit2 style={{ width: 15, height: 15 }} />
                  </button>
                  <button onClick={() => handleDelete(proj.id, proj.name)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Delete Project">
                    <Trash2 style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2" onClick={() => handleOpenEdit(proj)}>{proj.subtitle || proj.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1" onClick={() => handleOpenEdit(proj)}>
                {(proj.tags || []).map((t, idx) => (
                  <span key={idx} className="tag-pill text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
