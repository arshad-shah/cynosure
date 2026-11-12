import { type CSSProperties, forwardRef, type ReactNode, useMemo } from "react";
import { type QrLevel, qrMatrix, qrPath } from "../../foundations/qr.js";
import type { Size } from "../../tokens/schema.js";

export interface QRCodeTokens {
  /** Colour of the dark modules. Default: the light palette's ink, in every colour mode. */
  color: string;
  /** Colour of the light modules and the quiet zone. Default: the light palette's surface, in every colour mode. */
  background: string;
  /** Width and height at `size="sm"`. */
  sizeSm: string;
  /** Width and height at `size="md"`. */
  sizeMd: string;
  /** Width and height at `size="lg"`. */
  sizeLg: string;
  /** Width and height of the centred icon, as a share of the code's width. Keep it at 22% or less. */
  iconSize: string;
  /** Corner radius of the code, quiet zone included. */
  radius: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    qrCode: QRCodeTokens;
  }
}

export interface QRCodeLabels {
  /** Accessible name when no `label` is given. Default "QR code". */
  name: string;
}

export interface QRCodeProps {
  /** The text to encode, usually a URL. Numbers and upper-case text use the compact modes; anything else is UTF-8. */
  value: string;
  /** Width and height: `sm`, `md` (default) or `lg` from the tokens, or a number of pixels. */
  size?: Size | number;
  /**
   * Error correction: how much of the code can be damaged or covered and still scan (L 7%, M 15%, Q 25%, H 30%).
   * Higher levels need a denser code. Default "M"; always "H" with an `icon`.
   */
  level?: QrLevel;
  /** Light modules around the code, which scanners need to find it. The standard asks for 4. Default 4. */
  quietZone?: number;
  /** Accessible name. Default `labels.name` ("QR code"). Say where it leads, and show the link as text too. */
  label?: string;
  /** Built-in strings. */
  labels?: Partial<QRCodeLabels>;
  /**
   * A logo drawn in the centre, on the light colour (an `<Icon>` or a small image). It covers modules, so the level is
   * raised to H.
   */
  icon?: ReactNode;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through `--cy-qr-code-*` tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: QRCodeLabels = { name: "QR code" };

/** A QR code drawn as one crisp SVG path, dark on light in every colour mode so phones can scan it. */
export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
  { value, size = "md", level = "M", quietZone = 4, label, labels, icon, className, style },
  ref,
) {
  const hasIcon = icon != null && icon !== false;
  const used = hasIcon ? "H" : level;
  const q = Math.max(0, Math.floor(quietZone));
  const { box, d } = useMemo(() => {
    const matrix = qrMatrix(value, { level: used });
    return { box: matrix.length + q * 2, d: qrPath(matrix, q) };
  }, [value, used, q]);
  const sizing = typeof size === "number" ? ({ "--_size": `${size}px` } as CSSProperties) : undefined;
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label ?? labels?.name ?? DEFAULT_LABELS.name}
      className={`cy-qr-code${className ? ` ${className}` : ""}`}
      data-size={typeof size === "number" ? undefined : size}
      data-level={used}
      style={sizing || style ? { ...sizing, ...style } : undefined}
    >
      <svg
        className="cy-reset cy-qr-code-svg"
        viewBox={`0 0 ${box} ${box}`}
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        <path className="cy-reset cy-qr-code-modules" d={d} />
      </svg>
      {hasIcon && <span className="cy-qr-code-icon">{icon}</span>}
    </div>
  );
});
