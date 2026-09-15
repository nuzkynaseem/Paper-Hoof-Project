import React from "react";
import { getMediaUrl } from "../utils/api";
import { isVideoMedia } from "../utils/media";

/**
 * Renders project media — a cover, dock tile or case study hero — picking <video> or
 * <img> from the file itself, so any standard format works in the same slot.
 *
 * `mediaType` is the optional stored hint (e.g. heroMediaType); detection falls back
 * to the URL's extension when it is absent or wrong.
 */
const ProjectMedia = ({
  url,
  mediaType,
  alt = "",
  className,
  style,
  controls = false,
  onError,
  ...rest
}) => {
  const resolved = getMediaUrl(url);
  if (!resolved) return null;

  if (isVideoMedia(url, mediaType)) {
    // loading/decoding are <img>-only hints; drop them rather than emit them on <video>.
    const { loading, decoding, ...videoProps } = rest;
    return (
      <video
        src={resolved}
        className={className}
        style={{ pointerEvents: "none", userSelect: "none", ...style }}
        controls={false}
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        disablePictureInPicture
        disableRemotePlayback
        onPause={(e) => {
          e.target.play().catch(() => {});
        }}
        preload="auto"
        onError={onError}
        {...videoProps}
      />
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      style={style}
      onError={onError}
      {...rest}
    />
  );
};

export default ProjectMedia;
