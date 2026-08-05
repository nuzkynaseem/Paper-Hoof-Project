// Admin media upload with progress reporting.
//
// Uses XMLHttpRequest rather than fetch: fetch cannot report *upload* progress, and
// pushing a cover image or a video through the API to R2 runs for several seconds.
// Without a measurable signal the button can only spin blindly, which reads as a
// frozen form and invites a second click.
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

/**
 * Uploads one file to /api/upload.
 *
 * @param {File} file
 * @param {{ onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<{ url: string, filename?: string, contentType?: string }>}
 */
export const uploadMedia = (file, { onProgress } = {}) =>
  new Promise((resolve, reject) => {
    const token = localStorage.getItem("paperhoof_admin_token");
    const body = new FormData();
    body.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    if (onProgress) {
      onProgress(0);
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        // Capped at 99: the bytes being sent is only the first half of the job —
        // the server still has to store them in R2 before it answers. Showing 100
        // while that happens would stall on a finished-looking button.
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(Math.min(percent, 99));
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
      reject(new Error(errorMessage(xhr.responseText, xhr.status)));
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    xhr.send(body);
  });
