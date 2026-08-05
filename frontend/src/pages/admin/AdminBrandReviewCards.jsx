import React, { useState, useEffect } from "react";
import { Layers, Save, Upload, Clock, Info } from "lucide-react";
import { API_BASE, getMediaUrl } from "../../utils/api";

export default function AdminBrandReviewCards({ showToast }) {
  const [cards, setCards] = useState([]);
  const [savingIndex, setSavingIndex] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const token = localStorage.getItem("paperhoof_admin_token");

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_BASE}/brand-review-cards`);
      const data = await res.json();
      setCards(data);
    } catch (err) {
      console.error("Failed to load cards:", err);
    }
  };

  const handleCardChange = (index, field, value) => {
    setCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingIndex(index);
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
      handleCardChange(index, "imageUrl", data.url);
      if (showToast) showToast("success", "Image uploaded", file.name);
    } catch (err) {
      if (showToast) showToast("error", "Upload failed", err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSaveCard = async (index) => {
    const card = cards[index];
    setSavingIndex(index);
    try {
      const res = await fetch(`${API_BASE}/brand-review-cards/${card.cardIndex}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(card),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to save card");
      }
      if (showToast) showToast("success", `Card #${card.cardIndex} updated`, `"${card.title}" saved successfully.`);
    } catch (err) {
      if (showToast) showToast("error", "Save failed", err.message);
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[#123524]">Brand Review Cards (6 Stack Cards)</h1>
        <p className="text-sm text-gray-600">
          Configure the 6 interactive cards rendered inside the Brand Review page swipe/stack interface.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) => (
          <div key={card.cardIndex || idx} className="editor-card space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center" style={{ borderBottom: "1px solid #f0f0eb", paddingBottom: 12 }}>
                <span className="flex items-center gap-2 font-bold text-[#123524] text-sm">
                  <Layers style={{ width: 15, height: 15, color: "#166534" }} />
                  Card #{card.cardIndex}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                  <Clock style={{ width: 13, height: 13 }} />
                  {card.minutes} Minutes
                </span>
              </div>

              <div className="input-group">
                <label>Card Title / Service Focus</label>
                <input
                  type="text"
                  value={card.title || ""}
                  onChange={(e) => handleCardChange(idx, "title", e.target.value)}
                  placeholder="e.g. Brand Audit & Strategy"
                  className="custom-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label>Duration (Minutes)</label>
                  <input
                    type="number"
                    value={card.minutes || 30}
                    onChange={(e) => handleCardChange(idx, "minutes", parseInt(e.target.value) || 0)}
                    className="custom-input"
                  />
                </div>
                <div className="input-group">
                  <label>Cover Image</label>
                  <label className="upload-btn justify-center" style={{ height: 42 }}>
                    <Upload style={{ width: 13, height: 13 }} />
                    <span>{uploadingIndex === idx ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, idx)}
                      className="hidden"
                      disabled={uploadingIndex === idx}
                    />
                  </label>
                </div>
              </div>

              <p className="text-[11px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Card Image Guideline:</strong> 1:1 Square or 4:3 ratio (800×800px or 800×600px) · JPG/PNG/WebP under 3MB.</span>
              </p>

              {card.imageUrl && (
                <div style={{ borderRadius: 10, overflow: "hidden", height: 140, border: "1px solid #e5e7eb" }}>
                  <img src={getMediaUrl(card.imageUrl)} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSaveCard(idx)}
                disabled={savingIndex === idx}
                className="action-btn-primary w-full justify-center py-2.5"
              >
                <Save style={{ width: 15, height: 15 }} />
                <span>{savingIndex === idx ? "Saving..." : `Save Card #${card.cardIndex}`}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
