import { type CSSProperties, forwardRef, type ReactNode } from "react";
import type { RootAttributes } from "../../foundations/attributes.js";
import { check } from "../../icons/check.js";
import { xCircle } from "../../icons/x-circle.js";
import { luminance, type Rgb } from "../../tokens/color.js";
import type { Size } from "../../tokens/schema.js";
import { Badge } from "../Badge/Badge.js";
import { readColor } from "../ColorField/read-color.js";

export interface ColorSampleTokens {
  /** Height of the surface at `size="md"` (`sm` is half of it, `lg` five thirds). */
  height: string;
  /** Corner radius of the surface. */
  radius: string;
  /** Space between the surface and the contrast line. */
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    colorSample: ColorSampleTokens;
  }
}

export interface ColorSampleLabels {
  /** The contrast line, from the ratio cut to two decimals. Default "Contrast 4.54:1". */
  contrast: (ratio: string) => string;
  /** A WCAG level the pair meets. Default "AA pass". */
  pass: (level: "AA" | "AAA") => string;
  /** A WCAG level the pair misses. Default "AAA fail". */
  fail: (level: "AA" | "AAA") => string;
  /** The name of a text sample without `label`. Default "#767676 on #ffffff". */
  on: (ink: string, color: string) => string;
  /** The sample text without `children`. Default "Aa". */
  sample: string;
}

export interface ColorSampleProps extends RootAttributes {
  /** The colour shown, as a surface: any CSS colour. */
  color: string;
  /**
   * A text colour (any CSS colour) to preview on `color`: the sample text is drawn in it and the contrast ratio is
   * shown with the WCAG levels the pair meets. A translucent ink is blended onto the colour first.
   */
  ink?: string | undefined;
  /** The sample text drawn in `ink`. Default `labels.sample` ("Aa"). */
  children?: ReactNode;
  /**
   * The accessible name. Default: the colour (`"teal"`), or `labels.on(ink, color)` with an ink. Without an ink the
   * sample is an image named by it; with one, a group.
   */
  label?: string | undefined;
  /** With `ink`: show the contrast line. Default true. */
  contrast?: boolean;
  /** Judge the pair as large text (WCAG: AA at 3:1, AAA at 4.5:1, not 4.5 and 7). Default false. */
  largeText?: boolean;
  /** Height of the surface and size of the sample text. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the contrast line, the levels and the sample. */
  labels?: Partial<ColorSampleLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-color-sample-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: ColorSampleLabels = {
  contrast: (ratio) => `Contrast ${ratio}:1`,
  pass: (level) => `${level} pass`,
  fail: (level) => `${level} fail`,
  on: (ink, color) => `${ink} on ${color}`,
  sample: "Aa",
};

/** `top` over `under` at `a` opacity, each channel rounded to 8 bits as a screen shows it. */
const blend = (top: Rgb, under: Rgb, a: number): Rgb =>
  top.map((c, i) => Math.round((c * a + (under[i] as number) * (1 - a)) * 255) / 255) as Rgb;

/** The WCAG contrast of `ink` on `color` as seen: a translucent colour over white, a translucent ink over that. */
export function sampleContrast(ink: string, color: string): number | null {
  const bg = readColor(color);
  const fg = readColor(ink);
  if (!bg || !fg) return null;
  const surface = blend(bg.rgb, [1, 1, 1], bg.a);
  const text = blend(fg.rgb, surface, fg.a);
  const [hi, lo] = [luminance(surface), luminance(text)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Two decimals, cut rather than rounded, so 4.499 never reads as 4.50; whole numbers lose their zeros. */
const cut = (ratio: number) => String(Math.floor(ratio * 100 + 1e-9) / 100);

/**
 * A colour shown as a surface (a palette entry, a picked colour), or text in one colour on another with its contrast
 * ratio and the WCAG levels it meets (a contrast preview). Read-only: to choose a colour use ColorSwatches or
 * ColorField.
 */
export const ColorSample = forwardRef<HTMLDivElement, ColorSampleProps>(function ColorSample(
  {
    color,
    ink,
    children,
    label,
    contrast = true,
    largeText = false,
    size = "md",
    labels,
    className,
    style,
    ...rest
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const ratio = ink === undefined ? null : sampleContrast(ink, color);
  const levels = [
    ["AA", largeText ? 3 : 4.5],
    ["AAA", largeText ? 4.5 : 7],
  ] as const;
  return (
    <div
      ref={ref}
      {...rest}
      {...(ink === undefined
        ? { role: "img", "aria-label": label ?? color }
        : { role: "group", "aria-label": label ?? text.on(ink, color) })}
      className={className ? `cy-color-sample ${className}` : "cy-color-sample"}
      data-size={size}
      style={style}
    >
      <div
        className="cy-color-sample-surface cy-reset"
        style={{ "--_bg": color, ...(ink !== undefined && { "--_ink": ink }) } as CSSProperties}
      >
        {ink !== undefined && <span className="cy-color-sample-text">{children ?? text.sample}</span>}
      </div>
      {ink !== undefined && contrast && ratio !== null && (
        <div className="cy-color-sample-contrast cy-reset">
          <span className="cy-color-sample-ratio">{text.contrast(cut(ratio))}</span>
          {levels.map(([level, needs]) => {
            const ok = ratio >= needs;
            return (
              <Badge key={level} tone={ok ? "success" : "danger"} icon={ok ? check : xCircle} size="sm">
                <span className="cy-reset" aria-hidden="true">
                  {level}
                </span>
                <span className="cy-visually-hidden">{ok ? text.pass(level) : text.fail(level)}</span>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
});
