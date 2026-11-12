import { type CSSProperties, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useDrag } from "../../foundations/drag.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { stepKey } from "../../foundations/keys.js";
import { clamp } from "../../foundations/math.js";
import { droplet } from "../../icons/droplet.js";
import { type Rgb, rgbToOklch, toHex } from "../../tokens/color.js";
import { type ColorSwatch, ColorSwatches } from "../ColorSwatches/ColorSwatches.js";
import { readColor } from "./read-color.js";

export { readColor };

import type { Size } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover } from "../Popover/Popover.js";
import { Slider } from "../Slider/Slider.js";
import { TextField } from "../TextField/TextField.js";

export interface ColorFieldTokens {
  swatchSize: string;
  areaHeight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    colorField: ColorFieldTokens;
  }
}

export interface ColorFieldLabels {
  /** Name of the swatch button and the picker panel. */
  pick: string;
  area: string;
  hue: string;
  alpha: string;
  eyedropper: string;
  /** Name of the swatch group in the picker. Default: "Swatches". */
  swatches: string;
  /** Error when the typed text is not a colour. */
  invalid: string;
}

export interface ColorFieldProps {
  /** The field's label. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean;
  /** Help text shown below the control and read with it. */
  description?: ReactNode;
  /** Your own error; it replaces the field's own messages. */
  error?: ReactNode;
  /** Any CSS colour; reported back in `format`. */
  value?: string;
  /** The starting colour when uncontrolled, any CSS colour. Default "black". */
  defaultValue?: string;
  /** Called when the colour changes (typed, picked or chosen from a swatch), with the colour written in `format`. */
  onChange?: (value: string) => void;
  /** How values are written: six-digit hex, `rgb(51 102 255)` or `oklch(55% 0.21 264)`. */
  format?: "hex" | "rgb" | "oklch";
  /** Let people set opacity (adds an opacity slider and alpha to the value). */
  alpha?: boolean;
  /** Colours offered in the picker: brand colours, presets, or recent colours you keep. */
  swatches?: (ColorSwatch | string)[] | undefined;
  /** Name the colour is submitted under in a form, written in `format`. */
  name?: string;
  /** Marks the field as required and makes its input required in a form. */
  required?: boolean;
  /** Turns off the input and the picker; the colour is not submitted with a form. */
  disabled?: boolean;
  /** Size of the field. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the picker's controls and the error for text that is not a colour. */
  labels?: Partial<ColorFieldLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: ColorFieldLabels = {
  pick: "Choose colour",
  area: "Saturation and brightness",
  hue: "Hue",
  alpha: "Opacity",
  eyedropper: "Pick a colour from the screen",
  swatches: "Swatches",
  invalid: "Enter a colour such as rgb(51 102 255), a hex code or a colour name.",
};

interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

const round = (n: number, digits = 0) => Number(n.toFixed(digits));

function rgbToHsv([r, g, b]: Rgb, hue = 0): Omit<Hsva, "a"> {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = hue;
  if (d) {
    if (max === r) h = 60 * (((g - b) / d + 6) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return { h, s: max ? d / max : 0, v: max };
}
function hsvToRgb({ h, s, v }: Hsva): Rgb {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5), f(3), f(1)];
}

function write(c: Hsva, format: ColorFieldProps["format"], withAlpha: boolean): string {
  const rgb = hsvToRgb(c);
  const a = withAlpha ? round(c.a, 2) : 1;
  if (format === "rgb") {
    const [r, g, b] = rgb.map((n) => Math.round(n * 255));
    return a < 1 ? `rgb(${r} ${g} ${b} / ${a})` : `rgb(${r} ${g} ${b})`;
  }
  if (format === "oklch") {
    const [L, C, H] = rgbToOklch(rgb);
    const body = `${round(L * 100, 1)}% ${round(C, 3)} ${round(C < 0.0005 ? 0 : H, 1)}`;
    return a < 1 ? `oklch(${body} / ${a})` : `oklch(${body})`;
  }
  const hex = toHex(rgb);
  return a < 1
    ? `${hex}${Math.round(a * 255)
        .toString(16)
        .padStart(2, "0")}`
    : hex;
}

const fromText = (text: string, hue = 0): Hsva | null => {
  const read = readColor(text);
  return read ? { ...rgbToHsv(read.rgb, hue), a: read.a } : null;
};

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

/** A colour input: type any CSS colour, or pick one with a saturation area, hue and opacity sliders, or the screen. */
export function ColorField({
  label,
  labelHidden,
  description,
  error,
  value,
  defaultValue = "black",
  onChange,
  format = "hex",
  alpha = false,
  swatches,
  name,
  required,
  disabled,
  size = "md",
  labels,
  className,
  style,
}: ColorFieldProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  // The full HSV colour is kept even when controlled: black or grey written as text has no saturation or hue, so the
  // picker would lose them. `value` is read afresh only when it is a different colour from the one kept here.
  const [inner, setInner] = useState(() => fromText(value ?? defaultValue) ?? { h: 0, s: 0, v: 0, a: 1 });
  const external = value === undefined ? null : fromText(value, inner.h);
  const color = external && write(external, "rgb", true) !== write(inner, "rgb", true) ? external : inner;
  const current = write(color, format, alpha);
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const dragFrom = useRef<Hsva | null>(null);
  const [dropper, setDropper] = useState(false);
  useEffect(() => setDropper(typeof window !== "undefined" && "EyeDropper" in window), []);

  const set = (next: Hsva) => {
    const out = write(next, format, alpha);
    setInner(next);
    setDraft(null);
    setInvalid(false);
    if (out !== current) onChange?.(out);
  };
  const commit = () => {
    if (draft === null) return;
    const next = fromText(draft, color.h);
    if (next) set(alpha ? next : { ...next, a: 1 });
    else setInvalid(true);
  };

  const fromPoint = (point: { x: number; y: number }) => {
    const box = (area.current as HTMLDivElement).getBoundingClientRect();
    set({
      ...color,
      s: clamp((point.x - box.left) / box.width),
      v: 1 - clamp((point.y - box.top) / box.height),
    });
  };
  // Dragging in the area through detent; Escape puts the colour back.
  useDrag(area, {
    onStart: ({ point }) => {
      dragFrom.current = color;
      area.current?.focus();
      fromPoint(point);
    },
    onMove: ({ point }) => fromPoint(point),
    onEnd: (_, cancelled) => {
      if (cancelled) set(dragFrom.current as Hsva);
    },
  });
  const onAreaKey = (event: KeyboardEvent<HTMLDivElement>) => {
    // Saturation along x, brightness along y; Shift for bigger steps.
    const axis = { min: 0, max: 1, step: 0.01, arrowsOnly: true };
    const s = stepKey(event, { ...axis, value: color.s, axis: "x" });
    const v = stepKey(event, { ...axis, value: color.v, axis: "y" });
    if (s === undefined && v === undefined) return;
    event.preventDefault();
    set({ ...color, s: s ?? color.s, v: v ?? color.v });
  };
  const pickFromScreen = async () => {
    try {
      const picked = await new (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper().open();
      const next = fromText(picked.sRGBHex, color.h);
      if (next) set({ ...next, a: color.a });
    } catch {
      // Cancelled (Escape) or refused: nothing to do.
    }
  };

  const swatch = `rgb(${hsvToRgb(color)
    .map((n) => Math.round(n * 255))
    .join(" ")} / ${alpha ? color.a : 1})`;
  const pct = (n: number) => Math.round(n * 100);

  const trigger = (
    <Popover
      label={text.pick}
      size="sm"
      placement="bottom"
      trigger={(props) => (
        <Button
          {...props}
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={text.pick}
          className="cy-color-field-trigger"
        >
          <span className="cy-color-field-swatch cy-reset" style={{ "--_c": swatch } as CSSProperties} />
        </Button>
      )}
    >
      <div className="cy-color-field-picker cy-reset">
        <div
          ref={area}
          role="slider"
          tabIndex={0}
          aria-label={text.area}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct(color.s)}
          aria-valuetext={`${text.area}: ${pct(color.s)}%, ${pct(color.v)}%`}
          className="cy-color-field-area cy-reset"
          style={
            {
              "--_hue": `hsl(${round(color.h)} 100% 50%)`,
              "--_x": `${color.s * 100}%`,
              "--_y": `${(1 - color.v) * 100}%`,
            } as CSSProperties
          }
          onKeyDown={onAreaKey}
        >
          <span className="cy-color-field-area-thumb cy-reset" />
        </div>
        {/* Hue and opacity tracks are drawn with the colours they choose (Slider's trackContent: no fill). */}
        <Slider
          label={text.hue}
          labelHidden
          min={0}
          max={360}
          value={round(color.h)}
          onChange={(h) => set({ ...color, h: h as number })}
          className="cy-color-field-hue"
          trackContent={<span className="cy-color-field-strip cy-reset" data-strip="hue" />}
        />
        {alpha && (
          <Slider
            label={text.alpha}
            labelHidden
            min={0}
            max={100}
            value={pct(color.a)}
            labels={{ value: (v) => `${v}%` }}
            onChange={(a) => set({ ...color, a: (a as number) / 100 })}
            className="cy-color-field-alpha"
            trackContent={
              <span
                className="cy-color-field-strip cy-reset"
                data-strip="alpha"
                style={
                  {
                    "--_c": `rgb(${hsvToRgb(color)
                      .map((n) => Math.round(n * 255))
                      .join(" ")})`,
                  } as CSSProperties
                }
              />
            }
          />
        )}
        {swatches && swatches.length > 0 && (
          <ColorSwatches
            label={text.swatches}
            swatches={swatches}
            size="sm"
            value={current}
            onChange={(v) => {
              const next = fromText(v);
              if (next) set(next);
            }}
          />
        )}
      </div>
    </Popover>
  );

  return (
    <TextField
      label={label}
      labelHidden={labelHidden}
      description={description}
      error={error ?? (invalid ? text.invalid : undefined)}
      required={required}
      disabled={disabled}
      size={size}
      className={className ? `cy-color-field ${className}` : "cy-color-field"}
      {...(style ? { style } : {})}
      autoComplete="off"
      spellCheck={false}
      value={draft ?? current}
      onChange={(next) => {
        setDraft(next);
        setInvalid(false);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
      }}
      addonStart={trigger}
      addonEnd={
        <>
          {dropper && !disabled && (
            <IconButton
              icon={droplet}
              label={text.eyedropper}
              variant="ghost"
              size="sm"
              onClick={pickFromScreen}
            />
          )}
          <HiddenValue
            name={name}
            value={current}
            disabled={disabled}
            onReset={() => {
              setInner(fromText(defaultValue) ?? inner);
              setDraft(null);
              setInvalid(false);
            }}
          />
        </>
      }
    />
  );
}
