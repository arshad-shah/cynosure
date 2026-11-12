import { type CSSProperties, forwardRef, type ReactNode } from "react";

export interface AspectRatioTokens {
  /** Corner radius of every AspectRatio, whatever its `radius` prop says. */
  radius: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    aspectRatio: AspectRatioTokens;
  }
}

/** A step of the radius scale (`--cy-radius-*`), or `none` for square corners. */
export type AspectRatioRadius = "none" | "sm" | "md" | "lg" | "card" | "full";

export interface AspectRatioProps {
  /**
   * Width divided by height: a number (`16 / 9`, `1`) or a CSS ratio (`"4/3"`). A number that is not above zero uses
   * the default. Default `16 / 9`.
   */
  ratio?: number | string | undefined;
  /** Rounds the corners from the radius tokens; the content is clipped to them. Default "none". */
  radius?: AspectRatioRadius;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only (width, margin, placement). The height always follows from the width. */
  style?: CSSProperties;
  /** What fills the box. Each child is stretched to it; an image, video or canvas covers it (`object-fit: cover`). */
  children?: ReactNode;
}

const DEFAULT_RATIO = 16 / 9;

/** A box that keeps a width-to-height ratio at any width, for an image, a video, a map, a chart or an embed. */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = DEFAULT_RATIO, radius = "none", className, style, children },
  ref,
) {
  const safe = typeof ratio === "number" && !(ratio > 0 && Number.isFinite(ratio)) ? DEFAULT_RATIO : ratio;
  return (
    <div
      ref={ref}
      className={className ? `cy-aspect-ratio ${className}` : "cy-aspect-ratio"}
      data-radius={radius}
      style={{ "--_ratio": safe, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
});
