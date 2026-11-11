import type { CSSProperties } from "react";
import type { Size } from "../../tokens/schema.js";

export interface SkeletonTokens {
  /** Placeholder fill. */
  color: string;
  /** The band that sweeps across while loading. */
  highlight: string;
  /** Corner radius of text and block shapes. */
  radius: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    skeleton: SkeletonTokens;
  }
}

export interface SkeletonProps {
  /** `text`: lines the height of text at `size`. `block`: a box. `circle`: an avatar or icon. */
  shape?: "text" | "block" | "circle";
  /** Text shape only: how many lines. The last of several is shorter, like a paragraph. */
  lines?: number;
  /** Text size the lines stand in for (shared vocabulary: docs/conventions.md). */
  size?: Size;
  /** Any CSS length. Default: the full width (text, block) or the height (circle). */
  width?: string | undefined;
  /** Any CSS length. Default: one line of text (block) or the circle's diameter (circle). */
  height?: string | undefined;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-skeleton-* tokens. */
  style?: CSSProperties;
}

/**
 * A placeholder in the shape of content that is still loading. It is hidden from assistive technology: mark the region
 * that owns it `aria-busy="true"` while it loads.
 */
export function Skeleton({
  shape = "text",
  lines = 1,
  size = "md",
  width,
  height,
  className,
  style,
}: SkeletonProps) {
  const count = shape === "text" ? Math.max(1, Math.floor(lines) || 1) : 1;
  return (
    <span
      className={className ? `cy-skeleton ${className}` : "cy-skeleton"}
      data-shape={shape}
      data-size={size}
      aria-hidden="true"
      style={{ "--_w": width, "--_h": height, ...style } as CSSProperties}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="cy-skeleton-bone cy-reset" />
      ))}
    </span>
  );
}
