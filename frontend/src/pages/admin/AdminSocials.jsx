import React, { useState, useEffect } from "react";
import { Mail, Instagram, Linkedin, Save, CheckCircle } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function AdminSocials({ showToast }) {
  const [email, setEmail] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("paperhoof_admin_token");

  useEffect(() => {
    fetchSocials();
  }, []);

  const fetchSocials = async () => {
    try {
      const res = await fetch(`${API_BASE}/site/socials`);
      const data = await res.json();
      setEmail(data.email || "");
      setInstagramUrl(data.instagramUrl || "");
      setLinkedinUrl(data.linkedinUrl || "");
    } catch (err) {
      console.error("Failed to load socials:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/site/socials`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, instagramUrl, linkedinUrl }),
      });

      if (!res.ok) throw new Error("Failed to save social links");
      if (showToast) showToast("Social & contact details saved successfully!", "success");
    } catch (err) {
      if (showToast) showToast("Error saving socials: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123524]">Socials & Contact Details</h1>
          <p className="text-sm text-gray-600">
            Manage contact emails and social media channel links rendered in the website footer and contact overlay.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="editor-card space-y-6">
        <div className="space-y-4">
          <div className="input-group">
            <label className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#166534]" />
              <span>Studio Contact Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@paperhoof.com"
              className="custom-input"
            />
          </div>

          <div className="input-group">
            <label className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Instagram Profile URL</span>
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/paperhoof"
              className="custom-input"
            />
          </div>

          <div className="input-group">
            <label className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span>LinkedIn Page URL</span>
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/paperhoof"
              className="custom-input"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button type="submit" disabled={saving} className="action-btn-primary px-6 py-2.5">
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Contact Info"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
