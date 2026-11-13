import { type CSSProperties, forwardRef, type ReactNode } from "react";

export interface OverlayFrameTokens {
  /** Space between the bottom edge and the overlay. */
  offset: string;
  /** Stacking order of the overlay over the content (sticky rows, a pinned heading). */
  layer: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    overlayFrame: OverlayFrameTokens;
  }
}

export interface OverlayFrameProps {
  /**
   * Content pinned over the frame at the bottom centre that does not scroll with what it covers: a "3 new" pill, a
   * "jump to latest" button. Nothing (null, undefined or false): no overlay.
   */
  overlay?: ReactNode;
  /** What the overlay sits over: one element (a scroller) that fills the frame. */
  children?: ReactNode;
  /** Added to the root element, for layout. */
  className?: string | undefined;
  /** Layout only. Restyle through --cy-overlay-frame-* tokens. */
  style?: CSSProperties | undefined;
  /** Set on the root element, for tests. */
  "data-testid"?: string | undefined;
}

/**
 * A frame whose content fills it, with an overlay at the bottom centre that stays put while the content scrolls
 * under it. ScrollArea and VirtualList hold their scroller in one. The frame is always there, overlay or not, so an
 * overlay that comes and goes never remounts the content (which would lose its scroll position).
 */
export const OverlayFrame = forwardRef<HTMLDivElement, OverlayFrameProps>(function OverlayFrame(
  { overlay, children, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      className={className ? `cy-overlay-frame ${className}` : "cy-overlay-frame"}
      style={style}
    >
      {children}
      {overlay != null && overlay !== false && (
        <div className="cy-overlay-frame-overlay cy-reset">{overlay}</div>
      )}
    </div>
  );
});
