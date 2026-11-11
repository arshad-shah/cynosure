import { type CSSProperties, useRef } from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { useRovingFocus } from "../../foundations/roving-focus.js";
import { check } from "../../icons/check.js";
import { luminance } from "../../tokens/color.js";
import type { Size } from "../../tokens/schema.js";
import { readColor } from "../ColorField/read-color.js";

export interface ColorSwatchesTokens {
  /** Swatch size at `md`. */
  size: string;
  /** Corner radius of a swatch. */
  radius: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    colorSwatches: ColorSwatchesTokens;
  }
}

export interface ColorSwatch {
  /** Any CSS colour. */
  value: string;
  /** Spoken name, e.g. "Brand red". Default: the value. */
  label?: string;
}

export interface ColorSwatchesProps {
  /** Accessible name of the group, e.g. "Recent colours". */
  label: string;
  /** The colours to offer: a CSS colour, or `{ value, label }` to give it a spoken name. */
  swatches: (ColorSwatch | string)[];
  /** The chosen colour, matched by colour (so "#FFF" and "white" are the same swatch). */
  value?: string | undefined;
  /** Called when a swatch is chosen (pressed, or reached with the arrow keys), with that swatch's `value`. */
  onChange: (value: string) => void;
  /** No swatch can be chosen. */
  disabled?: boolean;
  /** Size of each swatch. Default "md". */
  size?: Size;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-color-swatches-* tokens. */
  style?: CSSProperties;
}

/** A colour's identity for matching: its rgb and alpha rounded, whatever syntax it was written in. */
const key = (text: string | undefined) => {
  const c = text ? readColor(text) : null;
  return c ? `${c.rgb.map((n) => Math.round(n * 255)).join(",")}/${Math.round(c.a * 100)}` : text;
};
/** Relative luminance (sRGB), to pick a tick that shows on the swatch. */
const lightness = (text: string) => {
  const c = readColor(text);
  return c ? luminance(c.rgb) : 1;
};

/**
 * A palette to pick a colour from: brand colours, recent colours, presets. An APG radio group: one tab stop, arrow keys
 * move and choose. Each swatch is named, and the chosen one shows a tick that contrasts with it.
 */
export function ColorSwatches({
  label,
  swatches,
  value,
  onChange,
  disabled = false,
  size = "md",
  className,
  style,
}: ColorSwatchesProps) {
  const group = useRef<HTMLDivElement>(null);
  useRovingFocus(group, { orientation: "both", selector: '[role="radio"]' });
  const chosen = key(value);
  const items = swatches.map((s) => (typeof s === "string" ? { value: s } : s));
  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={className ? `cy-color-swatches ${className}` : "cy-color-swatches"}
      data-size={size}
      style={style}
    >
      {items.map((item) => {
        const on = chosen !== undefined && key(item.value) === chosen;
        return (
          <ButtonBase
            key={item.value}
            role="radio"
            aria-checked={on}
            aria-label={item.label ?? item.value}
            disabled={disabled}
            data-roving=""
            className="cy-color-swatches-swatch cy-reset"
            data-light={lightness(item.value) > 0.4 ? "" : undefined}
            style={{ "--_swatch": item.value } as CSSProperties}
            onClick={() => onChange(item.value)}
            // Arrow keys move focus (roving); in a radio group the focused swatch is chosen too, once one is.
            onFocus={() => chosen !== undefined && !on && onChange(item.value)}
          >
            {on && <Icon icon={check} size="sm" />}
          </ButtonBase>
        );
      })}
    </div>
  );
}
