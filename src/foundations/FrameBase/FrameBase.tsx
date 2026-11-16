import { type CSSProperties, forwardRef } from "react";

export interface FrameBaseProps {
  /** Names the frame for assistive technology (`aria-label`; never a `title` tooltip). */
  label: string;
  /** The document to show, as HTML (`srcdoc`). */
  srcDoc: string;
  /**
   * What the document may do, as the `sandbox` attribute's tokens. Default "": nothing (no scripts, no forms, no
   * popups, no same origin, no top navigation). Add tokens only for content you trust.
   */
  sandbox?: string;
  /** `lazy` waits until the frame is near the screen. Default "eager". */
  loading?: "lazy" | "eager";
  /** Added to the iframe, for layout. */
  className?: string | undefined;
  /** Layout only. */
  style?: CSSProperties | undefined;
}

/**
 * The native `<iframe>` for Cynosure, and the only module allowed to render one: a sandboxed document from `srcDoc`,
 * with nothing allowed unless `sandbox` says so, and no referrer. No visual opinions: composites style it.
 */
export const FrameBase = forwardRef<HTMLIFrameElement, FrameBaseProps>(function FrameBase(
  { label, srcDoc, sandbox = "", loading = "eager", className, style },
  ref,
) {
  return (
    // biome-ignore lint/a11y/useIframeTitle: named with aria-label; Cynosure never writes title= (a native tooltip)
    <iframe
      ref={ref}
      aria-label={label}
      srcDoc={srcDoc}
      sandbox={sandbox}
      referrerPolicy="no-referrer"
      loading={loading}
      className={className}
      style={style}
    />
  );
});
