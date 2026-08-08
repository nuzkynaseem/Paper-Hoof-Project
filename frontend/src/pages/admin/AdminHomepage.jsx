import React, { useState, useEffect } from "react";
import { Video, FileText, Save, Play, Eye, Info } from "lucide-react";
import { API_BASE, getMediaUrl } from "../../utils/api";
import { VIDEO_ACCEPT } from "../../utils/media";
import { uploadMedia } from "../../utils/uploadMedia";
import UploadButton from "./UploadButton";

export default function AdminHomepage({ showToast }) {
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroVideoUrlMobile, setHeroVideoUrlMobile] = useState("");
  const [introText, setIntroText] = useState("");
  // Which variant ("desktop" | "mobile") is uploading, and its progress.
  const [uploadingTarget, setUploadingTarget] = useState(null);
  const [uploadPercent, setUploadPercent] = useState(null);
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
      setHeroVideoUrlMobile(data.heroVideoUrlMobile || "");
      setIntroText(data.secondSectionDescription || data.secondSectionTitle || "");
    } catch (err) {
      console.error("Failed to load homepage content:", err);
    }
  };

  const handleFileUpload = async (file, target) => {
    setUploadingTarget(target);
    setUploadPercent(0);
    try {
      const data = await uploadMedia(file, { onProgress: setUploadPercent });
      (target === "mobile" ? setHeroVideoUrlMobile : setHeroVideoUrl)(data.url);
      if (showToast) showToast("success", "Video uploaded", file.name);
    } catch (err) {
      if (showToast) showToast("error", "Upload failed", err.message || "Failed to fetch");
    } finally {
      setUploadingTarget(null);
      setUploadPercent(null);
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
          heroVideoUrlMobile,
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
              <p className="text-xs text-gray-500">Background looping video — a desktop (16:9) version and an optional mobile (9:16) version</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Desktop variant */}
            <div className="input-group">
              <label>Desktop Hero Video — URL or Direct Upload</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://domain.com/hero-desktop.mp4"
                  className="custom-input flex-1"
                />
                <UploadButton
                  iconSize={15}
                  accept={VIDEO_ACCEPT}
                  idleLabel="Upload Desktop"
                  busy={uploadingTarget === "desktop"}
                  progress={uploadingTarget === "desktop" ? uploadPercent : null}
                  onFile={(file) => handleFileUpload(file, "desktop")}
                />
              </div>
              <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 mt-2">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Desktop — Recommended:</strong> 16:9 landscape · 1920×1080px MP4 (H.264) or WebM · muted autoplay loop, ideally under 20MB.</span>
              </p>
            </div>

            {/* Mobile variant */}
            <div className="input-group">
              <label>Mobile Hero Video — URL or Direct Upload (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroVideoUrlMobile}
                  onChange={(e) => setHeroVideoUrlMobile(e.target.value)}
                  placeholder="https://domain.com/hero-mobile.mp4"
                  className="custom-input flex-1"
                />
                <UploadButton
                  iconSize={15}
                  accept={VIDEO_ACCEPT}
                  idleLabel="Upload Mobile"
                  busy={uploadingTarget === "mobile"}
                  progress={uploadingTarget === "mobile" ? uploadPercent : null}
                  onFile={(file) => handleFileUpload(file, "mobile")}
                />
              </div>
              <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 mt-2">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Mobile — Recommended:</strong> 3:4 portrait · 1080×1440px MP4 (H.264) · muted autoplay loop, ideally under 10MB. Phones show this version inside a 3:4 hero frame; when left empty, the desktop video is used everywhere.</span>
              </p>
            </div>

            {(heroVideoUrl || heroVideoUrlMobile) && (
              <div className="video-preview-wrapper">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 font-semibold">
                  <Play style={{ width: 13, height: 13, color: "#166534" }} />
                  <span>Video Previews</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {heroVideoUrl && (
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Desktop · 16:9</span>
                      <video
                        src={getMediaUrl(heroVideoUrl)}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full max-h-[240px] object-cover rounded-lg border border-gray-200"
                        style={{ aspectRatio: "16 / 9" }}
                      />
                    </div>
                  )}
                  {heroVideoUrlMobile && (
                    <div className="shrink-0">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Mobile · 3:4</span>
                      <video
                        src={getMediaUrl(heroVideoUrlMobile)}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="h-[240px] object-cover rounded-lg border border-gray-200"
                        style={{ aspectRatio: "3 / 4" }}
                      />
                    </div>
                  )}
                </div>
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
