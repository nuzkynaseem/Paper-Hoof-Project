import React from "react";
import { Upload, Loader2 } from "lucide-react";

/**
 * File-picker button that shows its own busy state.
 *
 * Every admin upload goes through here so the cue is identical everywhere: the icon
 * becomes a spinner, the label counts the transfer up, and the control stops
 * accepting clicks until the request settles.
 */
export default function UploadButton({
  onFile,
  accept,
  busy = false,
  progress = null,
  idleLabel = "Upload",
  busyLabel = "Uploading",
  className = "",
  style,
  iconSize = 14,
}) {
  const handleChange = (event) => {
    const file = event.target.files && event.target.files[0];
    // Cleared before dispatching: an unchanged value fires no change event, so
    // re-picking the same file after a failed upload would otherwise do nothing.
    event.target.value = "";
    if (file) onFile(file);
  };

  const label = busy
    ? typeof progress === "number"
      ? `${busyLabel} ${progress}%`
      : `${busyLabel}…`
    : idleLabel;

  return (
    <label
      className={`upload-btn ${busy ? "is-uploading" : ""} ${className}`.trim()}
      style={style}
      aria-busy={busy}
    >
      {busy ? (
        <Loader2
          className="upload-btn-spinner"
          style={{ width: iconSize, height: iconSize }}
          aria-hidden="true"
        />
      ) : (
        <Upload style={{ width: iconSize, height: iconSize }} aria-hidden="true" />
      )}
      <span>{label}</span>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={busy}
      />
    </label>
  );
}
