// Central API Base URL Helper
const rawBackendUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

const getSecureBackendUrl = (url) => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      return url.replace('http://', 'https://');
    }
  }
  return url;
};

export const BACKEND_URL = getSecureBackendUrl(rawBackendUrl);
export const API_BASE = `${BACKEND_URL.replace(/\/$/, '')}/api`;

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};

export const getMediaUrl = (url) => {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  // Already resolvable on its own — data URIs, blob previews, protocol-relative URLs
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
  if (trimmed.startsWith("//")) return trimmed;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // Upgrade http→https when the page is served over https (avoids mixed-content blocks)
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      trimmed.startsWith("http://") &&
      !/^http:\/\/(localhost|127\.0\.0\.1)/.test(trimmed)
    ) {
      return trimmed.replace("http://", "https://");
    }
    return trimmed;
  }

  const base = BACKEND_URL.replace(/\/$/, "");

  // Reduce every stored shape to a bare 'uploads/<file>' path. Older uploads were
  // saved as '/api/uploads/uploads/<file>' and some as '/static/uploads/<file>'.
  let path = trimmed.replace(/^\/+/, "").replace(/^api\//, "").replace(/^static\//, "");
  while (path.startsWith("uploads/uploads/")) {
    path = path.slice("uploads/".length);
  }

  if (!path.startsWith("uploads/")) {
    // A rooted path that names no upload (e.g. '/paperhoof-logo.svg') is a frontend
    // asset, not media — leave it alone. A bare relative name is a legacy upload.
    if (trimmed.startsWith("/")) return trimmed;
    path = `uploads/${path}`;
  }

  return `${base}/api/${path}`;
};
