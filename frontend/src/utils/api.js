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

const BACKEND_URL = getSecureBackendUrl(rawBackendUrl);
export const API_BASE = `${BACKEND_URL.replace(/\/$/, '')}/api`;

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};
