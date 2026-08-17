// Admin media upload with progress reporting.
//
// Files go straight from the browser to R2 via a presigned PUT. That is not an
// optimisation — it is the only way to lift the size cap. The API is hosted on a
// serverless platform that rejects any request body over ~4.5 MB *before* the
// function runs (measured: 4 MB reaches the handler, 4.3 MB returns 413), so no
// amount of backend code can accept a larger file through /api/upload. A direct
// PUT has no such ceiling — R2 takes up to 5 GB in a single request.
//
// POST /api/upload remains as a fallback for servers without R2 configured, which
// is what local development uses.
//
// XMLHttpRequest throughout, because fetch cannot report upload progress.
import { API_BASE } from "./api";

/** Pulls a readable message out of an error body, whatever shape it arrives in. */
const errorMessage = (responseText, status) => {
  try {
    const parsed = JSON.parse(responseText);
    const detail = parsed && parsed.detail;
    if (typeof detail === "string" && detail) return detail;
    if (detail) return JSON.stringify(detail);
  } catch (_) {
    /* not JSON — fall through to the status line */
  }
  return `Upload failed (${status})`;
};

const authHeader = () => {
  const token = localStorage.getItem("paperhoof_admin_token");
  return token ? `Bearer ${token}` : null;
};

/** Guesses mime type if browser leaves file.type empty (common for video files) */
const getContentType = (file) => {
  if (file.type && file.type.trim()) return file.type;
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".m4v")) return "video/x-m4v";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
};

/** Asks the API where to PUT. Throws auth errors, returns null if server lacks R2 credentials. */
const requestPresign = async (file) => {
  const token = authHeader();
  const contentType = getContentType(file);

  const res = await fetch(`${API_BASE}/upload/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify({ filename: file.name, contentType }),
  });

  // 401 / 403 = Authentication problem. Must not be swallowed.
  if (res.status === 401 || res.status === 403) {
    throw new Error("Your login session has expired. Please refresh the page and log in again.");
  }

  // 404 = server predates this endpoint, 503 = R2 not configured on server.
  if (res.status === 404 || res.status === 503) return null;

  if (!res.ok) throw new Error(errorMessage(await res.text(), res.status));

  const data = await res.json();
  if (!data.uploadUrl || !data.url) return null;
  return data;
};

/** Sends the bytes with XHR so progress can be reported. */
const putWithProgress = (url, file, contentType, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    if (contentType) {
      xhr.setRequestHeader("Content-Type", contentType);
    }

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      };
    }

    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(errorMessage(xhr.responseText, xhr.status)));
    xhr.onerror = () =>
      reject(new Error("Could not reach Cloudflare R2 storage. Check network connection or bucket CORS settings."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(file);
  });

/** Legacy path: the file travels through the API. Subject to host body limits (~4 MB). */
const uploadThroughApi = (file, onProgress) =>
  new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload`);
    if (authHeader()) xhr.setRequestHeader("Authorization", authHeader());

    if (onProgress) {
      onProgress(0);
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress(Math.min(Math.round((event.loaded / event.total) * 100), 99));
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let payload = null;
        try {
          payload = JSON.parse(xhr.responseText);
        } catch (_) {}
        if (payload && payload.url) {
          if (onProgress) onProgress(100);
          resolve(payload);
        } else {
          reject(new Error("Upload succeeded but returned no URL."));
        }
        return;
      }
      if (xhr.status === 413) {
        reject(
          new Error(
            "File is too large for server upload route. Cloudflare R2 is required for direct uploads."
          )
        );
        return;
      }
      reject(new Error(errorMessage(xhr.responseText, xhr.status)));
    };
    xhr.onerror = () => reject(new Error("Network error during upload. File may exceed host size limit."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(body);
  });

// Re-encode heavy stills to WebP before they leave the browser.
const CONVERT_TYPES = ["image/png", "image/jpeg"];
const CONVERT_OVER_BYTES = 400 * 1024;
const MAX_SIDE = 2560;

const toWebP = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    const giveUp = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.onerror = giveUp;
    img.onload = () => {
      try {
        let { width, height } = img;
        const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob && blob.type === "image/webp" && blob.size < file.size * 0.8) {
              const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
              resolve(new File([blob], name, { type: "image/webp" }));
            } else {
              resolve(file);
            }
          },
          "image/webp",
          0.85
        );
      } catch (_) {
        giveUp();
      }
    };
    img.src = objectUrl;
  });

const prepareFile = (file) =>
  CONVERT_TYPES.includes(file.type) && file.size > CONVERT_OVER_BYTES
    ? toWebP(file)
    : Promise.resolve(file);

/**
 * Uploads one file and returns where it now lives.
 *
 * @param {File} rawFile
 * @param {{ onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<{ url: string, key?: string, contentType?: string, storage?: string }>}
 */
export const uploadMedia = async (rawFile, { onProgress } = {}) => {
  if (onProgress) onProgress(0);

  const file = await prepareFile(rawFile);

  let presigned = null;
  let presignErr = null;

  try {
    presigned = await requestPresign(file);
  } catch (err) {
    presignErr = err;
    // If it's an auth error, abort immediately — do not fall back to POST /api/upload
    if (err.message && err.message.includes("session has expired")) {
      throw err;
    }
  }

  if (presigned) {
    const targetType = presigned.contentType || getContentType(file);
    await putWithProgress(presigned.uploadUrl, file, targetType, onProgress);
    if (onProgress) onProgress(100);
    return {
      url: presigned.url,
      key: presigned.key,
      contentType: targetType,
      storage: "r2-direct",
    };
  }

  // If presign failed and the file is > 4MB (like most video files), serverless POST /api/upload will fail.
  if (file.size > 4 * 1024 * 1024) {
    if (presignErr) throw presignErr;
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds server direct limit (4 MB) and storage presign is unavailable.`
    );
  }

  return uploadThroughApi(file, onProgress);
};

