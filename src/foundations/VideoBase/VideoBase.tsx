import { type CSSProperties, forwardRef, useEffect, useMemo, useRef } from "react";
import { mergeRefs } from "../refs.js";

export interface VideoBaseProps {
  /** Names the picture for assistive technology ("Camera"). */
  label: string;
  /** A live stream to play (a camera's), or null for none. Set as the element's `srcObject`. */
  stream: MediaStream | null;
  /** Added to the video element, for layout. */
  className?: string | undefined;
  /** Layout only. */
  style?: CSSProperties | undefined;
}

/**
 * The native `<video>` for Cynosure, and the only module allowed to render one: a live MediaStream, muted and played
 * inline (so phones neither ask for sound nor go full screen), started as soon as it is set. No controls, no visual
 * opinions: composites style it.
 */
export const VideoBase = forwardRef<HTMLVideoElement, VideoBaseProps>(function VideoBase(
  { label, stream, className, style },
  ref,
) {
  const own = useRef<HTMLVideoElement>(null);
  const merged = useMemo(() => mergeRefs(own, ref), [ref]);
  useEffect(() => {
    const video = own.current;
    if (!video || video.srcObject === stream) return;
    video.srcObject = stream;
    // A refused play (the element left the page, a new stream arrived) changes nothing.
    if (stream) video.play().catch(() => {});
  }, [stream]);
  return (
    <video
      ref={merged}
      aria-label={label}
      muted
      playsInline
      autoPlay
      disablePictureInPicture
      className={className}
      style={style}
    />
  );
});
