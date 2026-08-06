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

/** Asks the API where to PUT. Returns null when direct upload is unavailable. */
const requestPresign = async (file) => {
  const res = await fetch(`${API_BASE}/upload/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader() ? { Authorization: authHeader() } : {}),
    },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });

  // 404 = server predates this endpoint, 503 = R2 not configured on that server.
  // Both mean "use the old route", and neither is worth surfacing to the user.
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
    // Must match the ContentType signed into the URL, or R2 rejects the signature.
    xhr.setRequestHeader("Content-Type", contentType);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        // Not capped at 99 like the API route: when this PUT finishes the object
        // is already stored, so there is no server-side step left to wait on.
        onProgress(Math.round((event.loaded / event.total) * 100));
      };
    }

    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(errorMessage(xhr.responseText, xhr.status)));
    xhr.onerror = () =>
      reject(new Error("Could not reach storage. Check the bucket's CORS rules."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(file);
  });

/** Legacy path: the file travels through the API. Subject to the host body limit. */
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
        // Held at 99: sending the bytes is only half the job here — the server
        // still has to store them in R2 before it answers.
        onProgress(Math.min(Math.round((event.loaded / event.total) * 100), 99));
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let payload = null;
        try {
          payload = JSON.parse(xhr.responseText);
        } catch (_) {
          /* handled below */
        }
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
            "File is too large for this server's upload route. Configure R2 so uploads go directly to storage."
          )
        );
        return;
      }
      reject(new Error(errorMessage(xhr.responseText, xhr.status)));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(body);
  });

/**
 * Uploads one file and returns where it now lives.
 *
 * @param {File} file
 * @param {{ onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<{ url: string, key?: string, contentType?: string, storage?: string }>}
 */
export const uploadMedia = async (file, { onProgress } = {}) => {
  if (onProgress) onProgress(0);

  let presigned = null;
  try {
    presigned = await requestPresign(file);
  } catch (err) {
    // A presign failure that is not "unsupported" still shouldn't strand the
    // upload — try the API route, which may well succeed for a small file.
    presigned = null;
  }

  if (presigned) {
    await putWithProgress(presigned.uploadUrl, file, presigned.contentType || file.type, onProgress);
    if (onProgress) onProgress(100);
    return {
      url: presigned.url,
      key: presigned.key,
      contentType: presigned.contentType,
      storage: "r2-direct",
    };
  }

  return uploadThroughApi(file, onProgress);
};
