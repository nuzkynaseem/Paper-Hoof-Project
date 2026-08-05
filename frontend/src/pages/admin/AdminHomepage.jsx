import React, { useState, useEffect } from "react";
import { Video, FileText, Save, Upload, Play, Eye, Info } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function AdminHomepage({ showToast }) {
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [introText, setIntroText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("paperhoof_admin_token");

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  const fetchHomepageContent = async () => {
    try {
      const res = await fetch(`${API_BASE}/site/homepage`);
      const data = await res.json();
      setHeroVideoUrl(data.heroVideoUrl || "");
      setIntroText(data.secondSectionDescription || data.secondSectionTitle || "");
    } catch (err) {
      console.error("Failed to load homepage content:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const currentToken = localStorage.getItem("paperhoof_admin_token");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const headers = {};
      if (currentToken) headers["Authorization"] = `Bearer ${currentToken}`;
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = `Upload failed (${res.status})`;
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.detail || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setHeroVideoUrl(data.url);
      if (showToast) showToast("success", "Video uploaded", file.name);
    } catch (err) {
      if (showToast) showToast("error", "Upload failed", err.message || "Failed to fetch");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/site/homepage`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          heroVideoUrl,
          secondSectionTitle: introText,
          secondSectionDescription: introText,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to save homepage content");
      }
      if (showToast) showToast("success", "Homepage updated", "Hero video and intro text saved successfully.");
    } catch (err) {
      if (showToast) showToast("error", "Save failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const previewWords = introText.split(" ").filter(Boolean);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#123524]">Homepage & Hero Media</h1>
        <p className="text-sm text-gray-600">
          Configure the main background hero video and the studio scroll-reveal introduction text.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Hero Video */}
        <div className="editor-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
              <Video style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#123524]">1: Homepage Hero Section (Video)</h2>
              <p className="text-xs text-gray-500">Main background looping video stream</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="input-group">
              <label>Hero Video URL or Direct Upload</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://domain.com/video.mp4"
                  className="custom-input flex-1"
                />
                <label className="upload-btn">
                  <Upload style={{ width: 15, height: 15 }} />
                  <span>{uploading ? "Uploading..." : "Upload (Cloudflare R2)"}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 mt-2">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Recommended Hero Video Guidelines:</strong> 16:9 widescreen format · 1920×1080px MP4 (H.264) · Muted autoplay loop under 20MB for fast initial page load.</span>
              </p>
            </div>

            {heroVideoUrl && (
              <div className="video-preview-wrapper">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 font-semibold">
                  <Play style={{ width: 13, height: 13, color: "#166534" }} />
                  <span>Video Preview</span>
                </div>
                <video
                  src={heroVideoUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full max-h-[260px] object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Intro Text */}
        <div className="editor-card">
          <div className="flex items-center gap-3 mb-4">
            <div style={{ padding: "10px", borderRadius: "0.5rem", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
              <FileText style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#123524]">2: Scroll-Reveal Introduction Text</h2>
              <p className="text-xs text-gray-500">
                The single introduction statement following the hero video — reveals word-by-word as visitors scroll down
              </p>
            </div>
          </div>
          <div className="input-group">
            <label>Introduction Statement Text</label>
            <textarea
              rows={4}
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="We are here to design for you, that's what makes us distinctive..."
              className="custom-input"
            />
          </div>
        </div>

        {/* Live Preview */}
        {previewWords.length > 0 && (
          <div className="editor-card">
            <div className="flex items-center gap-3 mb-5">
              <div style={{ padding: "10px", borderRadius: "0.5rem", background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
                <Eye style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#123524]">Live Preview — Scroll Reveal Effect</h2>
                <p className="text-xs text-gray-500">
                  This is exactly how the text appears word-by-word on the public homepage as visitors scroll down.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#123524",
                borderRadius: "1rem",
                padding: "2.5rem",
                border: "1px solid rgba(151, 217, 175, 0.2)",
              }}
            >
              <p style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.6rem)", lineHeight: 1.7, fontWeight: 500 }}>
                {previewWords.map((word, i) => {
                  const simulatedActive = previewWords.length * 0.6;
                  const wordOpacity = Math.min(1, Math.max(0.18, simulatedActive - i));
                  return (
                    <span
                      key={i}
                      style={{
                        opacity: wordOpacity,
                        color: wordOpacity > 0.8 ? "#97D9AF" : "#f5f5f5",
                        marginRight: "0.35em",
                        display: "inline-block",
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              ↑ Green/bright words = revealed while scrolling · Faded words = hidden · Changes update live site instantly
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="action-btn-primary px-6 py-3">
            <Save style={{ width: 15, height: 15 }} />
            <span>{saving ? "Saving Changes..." : "Save Homepage Content"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
