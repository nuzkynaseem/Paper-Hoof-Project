import React, { useState } from "react";
import { Plus, Edit2, Trash2, Upload, X, CheckCircle, Lightbulb, Star, Image, Video, Code } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function AdminProjects({ projects = [], onProjectsChange, workScopes = [], showToast }) {
  const [editingProject, setEditingProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCompIndex, setUploadingCompIndex] = useState(null);

  const token = localStorage.getItem("paperhoof_admin_token");

  // Form State
  const [formData, setFormData] = useState({
    id: "",
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
    order: 0,
  });

  const handleOpenNew = () => {
    setFormData({
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
      components: project.components || [],
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
      const updated = exists ? prev.tags.filter((t) => t !== tagName) : [...prev.tags, tagName];
      return { ...prev, tags: updated };
    });
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
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
      
      setFormData((prev) => ({ ...prev, [field]: data.url }));
      if (showToast) showToast(`File uploaded successfully for ${field}`, "success");
    } catch (err) {
      if (showToast) showToast("Upload error: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // Component Upload Handling
  const handleComponentFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCompIndex(index);
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

      handleUpdateComponent(index, "contentUrl", data.url);
      if (showToast) showToast(`Case study component asset #${index + 1} uploaded!`, "success");
    } catch (err) {
      if (showToast) showToast("Component asset upload error: " + err.message, "error");
    } finally {
      setUploadingCompIndex(null);
    }
  };

  // Component Management
  const handleAddComponent = () => {
    const newComp = {
      id: Date.now().toString(),
      type: "image",
      contentUrl: "",
      insight: { title: "", description: "" },
    };
    setFormData((prev) => ({ ...prev, components: [...prev.components, newComp] }));
  };

  const handleUpdateComponent = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.components];
      if (field.startsWith("insight.")) {
        const insightField = field.split(".")[1];
        updated[index].insight = {
          ...(updated[index].insight || {}),
          [insightField]: value,
        };
      } else {
        updated[index][field] = value;
      }
      return { ...prev, components: updated };
    });
  };

  const handleRemoveComponent = (index) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.coverImage.trim()) {
      if (showToast) showToast("Please provide a project name and cover image.", "error");
      return;
    }

    setSaving(true);

    try {
      const isNew = !editingProject;
      const url = isNew ? `${API_BASE}/projects` : `${API_BASE}/projects/${formData.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save project content");

      const successMsg = `Project "${formData.name}" ${isNew ? "created" : "updated"} successfully!`;
      if (showToast) showToast(successMsg, "success");
      setModalOpen(false);
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      if (showToast) showToast("Error saving project: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete project");
      if (showToast) showToast("Project deleted successfully", "success");
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      if (showToast) showToast("Error deleting project: " + err.message, "error");
    }
  };

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
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="project-admin-card">
            <div className="project-card-image-wrap">
              <img
                src={proj.coverImage || proj.image}
                alt={proj.name}
                className="w-full h-48 object-cover"
              />
              {proj.isFeatured && (
                <span className="featured-badge">
                  <Star className="w-3 h-3 text-[#97d9af] fill-[#97d9af]" /> Featured
                </span>
              )}
            </div>

            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase font-bold text-[#166534] tracking-wider">
                    {proj.category || "Project"}
                  </span>
                  <h3 className="text-lg font-bold text-[#123524]">{proj.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="p-1.5 text-gray-500 hover:text-[#123524] transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2">
                {proj.subtitle || proj.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(proj.tags || []).map((t, idx) => (
                  <span key={idx} className="tag-pill text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Editor Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-3xl max-h-[90vh] overflow-y-auto relative">
            {/* STICKY Header with close icon pinned to top at all times when scrolling */}
            <div className="sticky top-0 bg-white z-30 pb-4 pt-2 -mx-8 px-8 border-b border-gray-200 flex justify-between items-center shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-[#123524]">
                  {editingProject ? "Edit Project" : "Create New Project"}
                </h2>
                <p className="text-xs text-gray-500">
                  {editingProject ? `Updating details for ${editingProject.name}` : "Configure new case study showcase"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-[#123524] hover:bg-gray-100 transition-all"
                title="Close Window"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-[#166534] font-bold">
                  1. Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label>Project Name (Homepage & Works List)</label>
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
                    <label>Category (e.g. Food Chain, Supermarket)</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Food Chain"
                      className="custom-input"
                    />
                  </div>
                </div>

                {/* Work Scope Pills Selection */}
                <div className="input-group">
                  <label>Assign Work Scope Pills</label>
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
                          ></span>
                          {scope.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Visual Assets */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-xs uppercase tracking-wider text-[#166534] font-bold">
                  2. Cover & Showcase Images
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label>Cover Image (Homepage & Works List)</label>
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
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "coverImage")}
                          className="hidden"
                        />
                      </label>
                    </div>
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
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "sliderImage")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Study Details */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-xs uppercase tracking-wider text-[#166534] font-bold">
                  3. Case Study Hero & Narrative
                </h3>

                <div className="input-group">
                  <label>Title (Top Heading inside Project Case Study)</label>
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
                    <label>Hero Media URL (Image or Video inside Project)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.heroMedia}
                        onChange={(e) => setFormData({ ...formData, heroMedia: e.target.value })}
                        placeholder="https://domain.com/hero-media.mp4"
                        className="custom-input flex-1"
                      />
                      <label className="upload-btn">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => handleFileUpload(e, "heroMedia")}
                          className="hidden"
                        />
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
                  <label>Subtitle (Explanation line following Project Hero)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="A bold rebrand for a fast-casual chain..."
                    className="custom-input"
                  />
                </div>

                <div className="input-group">
                  <label>Read More Text (Detailed explanation on Read More click)</label>
                  <textarea
                    rows={3}
                    value={formData.readMoreText}
                    onChange={(e) => setFormData({ ...formData, readMoreText: e.target.value })}
                    placeholder="We crafted a high-impact color system paired with..."
                    className="custom-input"
                  />
                </div>
              </div>

              {/* Dynamic Case Study Components Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-[#166534] font-bold">
                      4. Case Study Presentation Components
                    </h3>
                    <p className="text-xs text-gray-500">
                      Add rich interactive components (Image, Video, HTML/Code) with direct file uploads & optional Insights.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="action-btn-primary py-1.5 px-3 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Component</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.components.map((comp, index) => (
                    <div key={comp.id || index} className="p-4 rounded-xl bg-[#f9fafb] border border-gray-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#123524] flex items-center gap-1.5">
                          {comp.type === "video" ? <Video className="w-3.5 h-3.5 text-[#166534]" /> : comp.type === "html" ? <Code className="w-3.5 h-3.5 text-blue-600" /> : <Image className="w-3.5 h-3.5 text-emerald-600" />}
                          Case Study Component #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(index)}
                          className="text-gray-400 hover:text-red-600 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="input-group">
                          <label>Asset Type</label>
                          <select
                            value={comp.type}
                            onChange={(e) => handleUpdateComponent(index, "type", e.target.value)}
                            className="custom-input"
                          >
                            <option value="image">Image Asset</option>
                            <option value="video">Video Stream</option>
                            <option value="html">Interactive HTML / Code</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 input-group">
                          <label>Media File / Content URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={comp.contentUrl}
                              onChange={(e) => handleUpdateComponent(index, "contentUrl", e.target.value)}
                              placeholder={comp.type === "html" ? "<div>HTML code...</div>" : "https://domain.com/image.jpg"}
                              className="custom-input flex-1"
                            />
                            {comp.type !== "html" && (
                              <label className="upload-btn">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadingCompIndex === index ? "Uploading..." : "Upload"}</span>
                                <input
                                  type="file"
                                  accept={comp.type === "video" ? "video/*" : "image/*"}
                                  onChange={(e) => handleComponentFileUpload(e, index)}
                                  className="hidden"
                                  disabled={uploadingCompIndex === index}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Preview Box */}
                      {comp.contentUrl && comp.type !== "html" && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 max-h-40 bg-white">
                          {comp.type === "video" ? (
                            <video src={comp.contentUrl} controls className="w-full max-h-36 object-cover" />
                          ) : (
                            <img src={comp.contentUrl} alt="Preview" className="w-full max-h-36 object-cover" />
                          )}
                        </div>
                      )}

                      {/* Optional Insight */}
                      <div className="p-3 rounded-lg bg-white border border-gray-200 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Optional Component Insight Pill (Shows on click inside case study)
                        </span>
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
                            placeholder="Insight Description (e.g. Eco-conscious kraft paper boxes)"
                            className="custom-input text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="action-btn-secondary text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="action-btn-primary px-6"
                >
                  {saving ? "Saving..." : editingProject ? "Save Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
