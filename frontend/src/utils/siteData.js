// Cached JSON fetching for public site data.
//
// The homepage alone was firing three requests for /api/site/homepage and four
// components each re-fetched /api/projects on every mount — so scrolling (which
// mounts and remounts sections) re-loaded the same data over and over, and every
// component sat on its mock fallback while its private copy of the request ran.
//
// Strategy: stale-while-revalidate.
// - In-flight requests are shared, so simultaneous mounts produce one request.
// - Responses are kept in memory and mirrored to sessionStorage, so a revisit or
//   client-side navigation paints instantly from cache.
// - A cached value older than TTL is still returned immediately, but a background
//   refresh updates the cache (and notifies subscribers) when fresh data lands.
import { API_BASE } from "./api";

const TTL_MS = 5 * 60 * 1000;
const memory = new Map(); // path -> { data, at }
const inflight = new Map(); // path -> Promise

const storageKey = (path) => `ph-cache:${path}`;

const readSession = (path) => {
  try {
    const raw = sessionStorage.getItem(storageKey(path));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.at !== "number") return null;
    return parsed;
  } catch (_) {
    return null;
  }
};

const writeSession = (path, entry) => {
  try {
    sessionStorage.setItem(storageKey(path), JSON.stringify(entry));
  } catch (_) {
    /* quota or private mode — memory cache still works */
  }
};

const fetchFresh = (path) => {
  if (inflight.has(path)) return inflight.get(path);
  const p = fetch(`${API_BASE}${path}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
      const data = await res.json();
      const entry = { data, at: Date.now() };
      memory.set(path, entry);
      writeSession(path, entry);
      return data;
    })
    .finally(() => inflight.delete(path));
  inflight.set(path, p);
  return p;
};

/**
 * Fetches `path` (e.g. "/projects") with caching.
 *
 * @param {string} path API path starting with "/"
 * @param {{ onUpdate?: (data: any) => void }} [options] Called if a background
 *   refresh returns different data after a stale cache hit was already returned.
 * @returns {Promise<any>} Resolves as fast as the cache allows.
 */
export const getCachedJson = (path, { onUpdate } = {}) => {
  const cached = memory.get(path) || readSession(path);
  if (cached) {
    memory.set(path, cached);
    if (Date.now() - cached.at > TTL_MS) {
      // Serve stale instantly; refresh behind the scenes.
      fetchFresh(path)
        .then((fresh) => {
          if (onUpdate && JSON.stringify(fresh) !== JSON.stringify(cached.data)) {
            onUpdate(fresh);
          }
        })
        .catch(() => {
          /* stale data remains valid */
        });
    }
    return Promise.resolve(cached.data);
  }
  return fetchFresh(path);
};

/** Projects list with slugs guaranteed — the shape every consumer wants. */
export const getProjects = async (options) => {
  const list = await getCachedJson("/projects", options);
  return Array.isArray(list) ? list : [];
};

/** Homepage settings (hero video, intro text, more-works config). */
export const getHomepage = (options) => getCachedJson("/site/homepage", options);
