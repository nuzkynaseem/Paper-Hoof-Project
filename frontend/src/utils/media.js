// Shared media-kind detection for project covers, dock tiles and case study heroes.
//
// A cover or hero may be uploaded as a still, an animated GIF, or a video, and the
// two need different elements: <img> cannot play an mp4, and <video> cannot render a
// jpg. GIF and animated WebP animate inside <img> on their own, so they stay images.

const VIDEO_EXTENSIONS = [
  "mp4",
  "webm",
  "mov",
  "m4v",
  "ogv",
  "ogg",
  "mkv",
  "avi",
];

// File-picker filters. Deliberately broad — the browser reports a concrete type per
// format and the backend stores whatever standard format is handed to it.
export const IMAGE_ACCEPT = "image/*";
export const VIDEO_ACCEPT = "video/*";
export const MEDIA_ACCEPT = "image/*,video/*";

/** True when the URL's own extension (or data: prefix) says video. */
export const hasVideoExtension = (url) => {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();
  if (/^data:video\//i.test(trimmed)) return true;
  if (/^data:/i.test(trimmed)) return false;

  // Drop query strings and fragments before looking at the extension, otherwise a
  // signed URL such as ".mp4?X-Amz-Signature=..." reads as having no extension.
  const path = trimmed.split(/[?#]/)[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(`.${ext}`));
};

/**
 * Decides whether to render `url` as video.
 *
 * An explicit "video" type wins so a stored heroMediaType is honoured even for an
 * extensionless URL, but an explicit "image" never suppresses a real video file —
 * a stale type field should not stop a playable upload from playing.
 */
export const isVideoMedia = (url, explicitType) =>
  explicitType === "video" || hasVideoExtension(url);
