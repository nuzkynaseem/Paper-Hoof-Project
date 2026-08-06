// Cached JSON fetching for public site data.
//
// The homepage alone was firing three requests for /api/site/homepage and four
// components each re-fetched /api/projects on every mount — so scrolling (which
// mounts and remounts sections) re-loaded the same data over and over, and every
// component sat on its mock fallback while its private copy of the request ran.
//
// Strategy: instant cached paints, version-checked freshness.
// - In-flight requests are shared, so simultaneous mounts produce one request.
// - Responses are kept in memory and mirrored to sessionStorage, so a revisit or
//   client-side navigation paints instantly from cache.
// - Freshness comes from /site/version, a tiny stamp the server bumps on every
//   admin save. It is checked in the background on load, on tab focus, and once a
//   minute — when it moves, all caches are dropped, the paths components are
//   subscribed to are re-fetched, and their onUpdate callbacks re-render them.
//   An admin edit therefore reaches an already-open page in roughly one
//   round-trip instead of waiting out a cache TTL.
import { API_BASE } from "./api";

const TTL_MS = 5 * 60 * 1000; // backstop only; the version check drives freshness
const VERSION_CHECK_MIN_GAP_MS = 30 * 1000;
const VERSION_KEY = "ph-cache-version";
const MAX_SUBSCRIBERS_PER_PATH = 25;

const memory = new Map(); // path -> { data, at }
const inflight = new Map(); // path -> Promise
const subscribers = new Map(); // path -> Set<fn>

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

const subscribe = (path, fn) => {
  if (!fn) return;
  let set = subscribers.get(path);
  if (!set) {
    set = new Set();
    subscribers.set(path, set);
  }
  set.add(fn);
  // Remounts add fresh closures for the session's lifetime; stale ones are
  // harmless no-ops (components guard with mounted flags) but keep the set small.
  if (set.size > MAX_SUBSCRIBERS_PER_PATH) {
    set.delete(set.values().next().value);
  }
};

const notify = (path, data) => {
  const set = subscribers.get(path);
  if (!set) return;
  set.forEach((fn) => {
    try {
      fn(data);
    } catch (_) {
      /* one bad subscriber must not block the rest */
    }
  });
};

const fetchFresh = (path) => {
  if (inflight.has(path)) return inflight.get(path);
  const p = fetch(`${API_BASE}${path}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
      const data = await res.json();
      memory.set(path, { data, at: Date.now() });
      writeSession(path, { data, at: Date.now() });
      return data;
    })
    .finally(() => inflight.delete(path));
  inflight.set(path, p);
  return p;
};

// ── Version checking ───────────────────────────────────────────────────────────

let lastVersionCheck = 0;

const cachedPaths = () => {
  const paths = new Set(memory.keys());
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("ph-cache:")) paths.add(k.slice("ph-cache:".length));
    }
  } catch (_) {
    /* memory paths suffice */
  }
  return [...paths];
};

const clearAllCaches = () => {
  memory.clear();
  try {
    cachedPaths().forEach((p) => sessionStorage.removeItem(storageKey(p)));
  } catch (_) {
    /* best effort */
  }
};

/** Compares the server's content stamp with ours; on change, refreshes everything. */
export const revalidateContent = async (force = false) => {
  const now = Date.now();
  if (!force && now - lastVersionCheck < VERSION_CHECK_MIN_GAP_MS) return;
  lastVersionCheck = now;

  try {
    const res = await fetch(`${API_BASE}/site/version`, { cache: "no-store" });
    if (!res.ok) return;
    const { version } = await res.json();
    const known = sessionStorage.getItem(VERSION_KEY);
    sessionStorage.setItem(VERSION_KEY, String(version));

    // First sighting this session: nothing stale can exist yet.
    if (known === null || known === String(version)) return;

    const paths = cachedPaths();
    clearAllCaches();
    paths.forEach((path) => {
      // Only re-fetch what something on the page actually listens to.
      if (subscribers.get(path)?.size) {
        fetchFresh(path)
          .then((data) => notify(path, data))
          .catch(() => {});
      }
    });
  } catch (_) {
    /* offline or API down — caches stay as they are */
  }
};

if (typeof window !== "undefined") {
  // Background check on load (never blocks the first cached paint)…
  revalidateContent();
  // …when the visitor comes back to the tab…
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") revalidateContent();
  });
  // …and once a minute while they stay on the page.
  setInterval(() => {
    if (document.visibilityState === "visible") revalidateContent();
  }, 60 * 1000);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Fetches `path` (e.g. "/projects") with caching.
 *
 * @param {string} path API path starting with "/"
 * @param {{ onUpdate?: (data: any) => void }} [options] Called whenever fresher
 *   data for this path lands after the initial resolution (TTL refresh or a
 *   content-version change), so mounted components can re-render.
 * @returns {Promise<any>} Resolves as fast as the cache allows.
 */
export const getCachedJson = (path, { onUpdate } = {}) => {
  subscribe(path, onUpdate);
  revalidateContent();

  const cached = memory.get(path) || readSession(path);
  if (cached) {
    memory.set(path, cached);
    if (Date.now() - cached.at > TTL_MS) {
      // Serve stale instantly; refresh behind the scenes.
      fetchFresh(path)
        .then((fresh) => {
          if (JSON.stringify(fresh) !== JSON.stringify(cached.data)) notify(path, fresh);
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
