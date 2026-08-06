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

// Stable public base for uploaded media. In production, /api/uploads/<file> is
// rewritten straight to this domain: every object there is served with an
// immutable year-long Cache-Control, so the browser downloads each image once,
// and skipping the API redirect saves a serverless invocation per image.
// Left empty in development so the backend's local-disk fallback keeps working.
export const MEDIA_BASE =
  process.env.REACT_APP_MEDIA_BASE ||
  (process.env.NODE_ENV === 'production'
    ? 'https://pub-890f739345cb4bd69d2c9be93e242605.r2.dev'
    : '');

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

  // Production: fetch straight from the immutable public media domain.
  if (MEDIA_BASE) return `${MEDIA_BASE.replace(/\/$/, "")}/${path}`;

  return `${base}/api/${path}`;
};
