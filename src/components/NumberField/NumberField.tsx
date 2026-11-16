import { type CSSProperties, type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { useDrag } from "../../foundations/drag.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { ariaNumber, clamp, plainNumber, roundLike, snapToStep } from "../../foundations/math.js";
import { minus } from "../../icons/minus.js";
import { plus } from "../../icons/plus.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";
import type { FieldLayoutProps } from "../Field/Field.js";
import { IconButton } from "../IconButton/IconButton.js";
import { TextField } from "../TextField/TextField.js";

export interface NumberFieldTokens {
  /** Colour of the `unit` text after the number. Default --cy-color-muted. */
  unitColor: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    numberField: NumberFieldTokens;
  }
}

export interface NumberFieldLabels {
  /** Stepper button names. Defaults: "Decrease", "Increase". */
  decrement: string;
  increment: string;
}

export interface NumberFieldProps extends FieldLayoutProps {
  /** Visible label; it names the field. */
  label: ReactNode;
  /** Visually hide the label (it still names the field). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the field. */
  description?: ReactNode;
  /** Error message shown below the field; it marks the field invalid. */
  error?: ReactNode;
  /** `null` is empty. */
  value?: number | null | undefined;
  /** Starting value when uncontrolled; `null` is empty. */
  defaultValue?: number | null;
  /**
   * Called with the new value when it is committed: a step, Enter, or leaving the field; with `commit="input"` also
   * while typing.
   */
  onChange?: ((value: number | null) => void) | undefined;
  /**
   * When typed text becomes the value. `"blur"`: on Enter or leaving the field. `"input"`: also as it is typed, each
   * time the text reads as a number within `min` and `max` (a live preview), and as `null` when it is emptied unless
   * the field is `required`; the text is left as typed until Enter or leaving the field, which clamp and rewrite it
   * as before. Steps commit at once either way. Default "blur".
   */
  commit?: "blur" | "input" | undefined;
  /**
   * Text after the number, inside the field ("px", "ms", "×"), for a unit `formatOptions` cannot write. It is not part
   * of the typed text, and is read with the value ("12 px").
   */
  unit?: string | undefined;
  /** Icon of the decrease stepper. Default: minus. */
  decrementIcon?: IconData | undefined;
  /** Icon of the increase stepper. Default: plus. */
  incrementIcon?: IconData | undefined;
  /**
   * Make the − and + buttons Tab stops (each shows its name as a tooltip on focus); pressing one keeps focus on it.
   * Default false: the field is one Tab stop, as in the APG spinbutton, and a press returns focus to the input.
   */
  steppersFocusable?: boolean | undefined;
  /** Smallest value. Typed and stepped values are kept at or above it, and Home jumps to it. */
  min?: number | undefined;
  /** Largest value. Typed and stepped values are kept at or below it, and End jumps to it. */
  max?: number | undefined;
  /** Arrow keys and steppers move by this; values they produce snap to it. Default 1. */
  step?: number;
  /** Page Up and Page Down move by this. Default: 10 steps. */
  largeStep?: number;
  /** Locale for reading and writing numbers. Default: the browser's. */
  locale?: string | undefined;
  /** How the value is written: currency, percent, units, digits… (`Intl.NumberFormat` options). */
  formatOptions?: Intl.NumberFormatOptions | undefined;
  /** Hide the − and + buttons (the keyboard still steps). */
  hideSteppers?: boolean;
  /** Name the plain number is submitted under in a form. */
  name?: string | undefined;
  /** Id of the form it belongs to, when it is not inside that form. */
  form?: string | undefined;
  /** Marks the field as required for form validation. */
  required?: boolean | undefined;
  /** Turns off the field and its stepper buttons. */
  disabled?: boolean | undefined;
  /** The value can be read but not changed. */
  readOnly?: boolean | undefined;
  /** Hint shown while the field is empty. */
  placeholder?: string | undefined;
  /** Size of the field. Default "md". */
  size?: Size;
  /** `outline` or `soft` (tinted, borderless until focus). Default "outline". */
  variant?: "outline" | "soft";
  /** Replace the built-in English text: the stepper button names. */
  labels?: Partial<NumberFieldLabels>;
  /**
   * Drag the label sideways to change the value, as design tools do: one `step` every few pixels, Shift for ten. Escape
   * mid-drag puts it back. The keys and the steppers still work as before.
   */
  scrub?: boolean;
  /** Id of the input; the label, description and error ids are built from it. Default: generated. */
  id?: string | undefined;
  /** Ids of the element(s) that name the field instead of its label (a column heading). Pair with `labelHidden`. */
  "aria-labelledby"?: string | undefined;
  /** Ids of more elements that describe the field, read before its own description and error. */
  "aria-describedby"?: string | undefined;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: NumberFieldLabels = { decrement: "Decrease", increment: "Increase" };

/** The marks a format writes, learnt from `Intl.NumberFormat` itself so every locale reads its own output. */
interface NumberMarks {
  group: string;
  decimal: string;
  minus: string;
  /** The ten digits of its numbering system, 0 to 9 (Arabic-Indic, Devanagari…). */
  digits: string[];
  /** Currency, percent and unit text and literals ("kr.", "%", "km/h"), longest first. */
  affixes: string[];
}

const marksCache = new Map<string, NumberMarks>();
const SAMPLES = [-1234567.5, 1234567.5, 1, 2];

function marksOf(locale: string | undefined, options: Intl.NumberFormatOptions | undefined): NumberMarks {
  const id = JSON.stringify([locale ?? "", options ?? {}]);
  const known = marksCache.get(id);
  if (known) return known;
  const plain = new Intl.NumberFormat(locale);
  const numberingSystem = (
    options?.numberingSystem ? new Intl.NumberFormat(locale, options) : plain
  ).resolvedOptions().numberingSystem;
  // The separators and signs of the field's own style (a currency may group differently), else of plain numbers.
  let styled: Intl.NumberFormatPart[] = [];
  try {
    styled = SAMPLES.flatMap((n) =>
      new Intl.NumberFormat(locale, {
        ...options,
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        minimumSignificantDigits: undefined,
        maximumSignificantDigits: undefined,
      }).formatToParts(n),
    );
  } catch {
    // Options that refuse one fraction digit: plain numbers' marks are enough.
  }
  const parts = [...styled, ...plain.formatToParts(-12345.6)];
  const of = (type: string, fallback: string) => parts.find((p) => p.type === type)?.value ?? fallback;
  const digitFormat = new Intl.NumberFormat(locale, { numberingSystem, useGrouping: false });
  const marks: NumberMarks = {
    group: of("group", ","),
    decimal: of("decimal", "."),
    minus: of("minusSign", "-"),
    digits: Array.from({ length: 10 }, (_, d) => digitFormat.format(d)),
    affixes: [
      ...new Set(
        styled
          .filter((p) => ["currency", "percentSign", "unit", "literal", "compact"].includes(p.type))
          .map((p) => p.value.trim())
          .filter(Boolean),
      ),
    ].sort((x, y) => y.length - x.length),
  };
  marksCache.set(id, marks);
  return marks;
}

/** Bidirectional marks some locales put around signs (Arabic's U+061C before the minus). */
const BIDI = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

/**
 * Reads what a person typed, or what the field wrote, in `locale` and `options`: the locale's digits (Arabic-Indic,
 * Devanagari…), group separators, decimal mark and minus, a typographic minus, currency, percent and unit text, and
 * accounting brackets.
 */
export function parseNumber(
  text: string,
  locale?: string,
  options?: Intl.NumberFormatOptions,
): number | null {
  const { group, decimal, minus, digits, affixes } = marksOf(locale, options);
  let t = text.replace(BIDI, "");
  // Accounting style writes a negative amount in brackets.
  const bracketed = /\(.*\)/.test(t);
  // Currency, percent and unit text first, so a dot in "kr." is not read as a separator.
  for (const affix of affixes)
    if (affix !== group.trim() && affix !== decimal && affix !== minus.replace(BIDI, ""))
      t = t.split(affix).join(" ");
  t = t.replace(/\p{Nd}/gu, (c) => {
    const local = digits.indexOf(c);
    return local >= 0 ? String(local) : c;
  });
  t = t.replace(/[()]/g, "");
  const minusMark = minus.replace(BIDI, "");
  if (minusMark && minusMark !== "-") t = t.split(minusMark).join("-");
  t = t.replace(/[−‒–]/g, "-");
  // A group mark that is a space (French, Swedish) matches any space; a typographic apostrophe matches a plain one.
  if (!group.trim()) t = t.replace(/\s/g, "");
  else {
    t = t.split(group).join("");
    if (group === "’") t = t.split("'").join("");
  }
  const cleaned = t
    .replace(/\s/g, "")
    .split(decimal)
    .join(".")
    .replace(/[^\d.-]/g, "");
  if (!/^-?\d*\.?\d+$|^-?\d+\.?$/.test(cleaned)) return null;
  let n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  if (bracketed && n > 0) n = -n;
  // Percent text is a hundred times the value; round away the noise of dividing (12.5% is 0.125).
  return options?.style === "percent" ? Number((n / 100).toPrecision(15)) : n;
}

/**
 * A number input: type it in your own format, or step it with the arrow keys, Page Up/Down, Home/End or the − and +
 * buttons. APG spinbutton; locale-aware; takes part in forms with the plain number.
 */
export function NumberField({
  label,
  labelHidden,
  layout,
  width,
  description,
  error,
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  step = 1,
  largeStep,
  locale,
  formatOptions,
  hideSteppers = false,
  commit: commitOn = "blur",
  unit,
  decrementIcon = minus,
  incrementIcon = plus,
  steppersFocusable = false,
  name,
  form,
  required,
  disabled,
  readOnly,
  placeholder,
  size = "md",
  variant = "outline",
  labels,
  scrub = false,
  id,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  className,
  style,
}: NumberFieldProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [current, setCurrent, resetCurrent] = useControllableState<number | null>(
    value,
    defaultValue,
    onChange,
  );
  const [draft, setDraft] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const format = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 20, ...formatOptions }),
    [locale, formatOptions],
  );
  const shown = (n: number | null) => (n === null ? "" : format.format(n));
  const spoken = (n: number) => (unit ? `${shown(n)} ${unit}` : shown(n));

  const limit = (n: number) => clamp(n, min ?? Number.NEGATIVE_INFINITY, max ?? Number.POSITIVE_INFINITY);
  const commit = (next: number | null) => {
    setDraft(null);
    if (next !== current) setCurrent(next);
    return next;
  };
  const stepBy = (delta: number): number | null => {
    if (disabled || readOnly) return current;
    const base = min ?? 0;
    const from = draft !== null ? (parseNumber(draft, locale, formatOptions) ?? current) : current;
    const start = from ?? (delta > 0 ? (min ?? 0) : (max ?? 0));
    // Snap onto the step grid (counted from min), without floating-point noise (0.3, not 0.30000000000000004).
    return commit(
      limit(from === null ? roundLike(start, step, base) : snapToStep(start + delta, step, base)),
    );
  };
  // commit="input": the text as typed becomes the value once it reads as a number in range; the text stays as typed.
  const onType = (text: string) => {
    setDraft(text);
    if (commitOn !== "input") return;
    // Emptied: "no value" when the field allows it; a required field keeps its value until a number is typed.
    if (text.trim() === "") {
      if (!required && current !== null) setCurrent(null);
      return;
    }
    const parsed = parseNumber(text, locale, formatOptions);
    if (parsed === null || parsed !== limit(parsed) || parsed === current) return;
    setCurrent(parsed);
  };
  const commitDraft = () => {
    if (draft === null) return;
    if (draft.trim() === "") return commit(null);
    const parsed = parseNumber(draft, locale, formatOptions);
    // Unreadable text goes back to the last good value.
    commit(parsed === null ? current : limit(parsed));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const big = largeStep ?? step * 10;
    const moves: Record<string, () => void> = {
      ArrowUp: () => stepBy(step),
      ArrowDown: () => stepBy(-step),
      PageUp: () => stepBy(big),
      PageDown: () => stepBy(-big),
      Enter: commitDraft,
    };
    if (min !== undefined) moves.Home = () => !disabled && !readOnly && commit(min);
    if (max !== undefined) moves.End = () => !disabled && !readOnly && commit(max);
    const move = moves[event.key];
    if (!move) return;
    if (event.key !== "Enter") event.preventDefault();
    move();
  };

  // Scrubbing: the field's own <label> is the handle.
  const handle = useRef<HTMLElement | null>(null);
  useClientLayoutEffect(() => {
    const el =
      scrub && !disabled && !readOnly
        ? ((input.current?.labels?.[0] as HTMLElement | undefined) ?? null)
        : null;
    if (handle.current && handle.current !== el) delete handle.current.dataset.scrub;
    if (el) el.dataset.scrub = "";
    handle.current = el;
  });
  const scrubFrom = useRef<number | null>(null);
  useDrag(handle, {
    distance: 3,
    touchAction: "css",
    onStart: () => {
      scrubFrom.current = current;
    },
    onMove: ({ delta, event }) => {
      const steps = Math.round(delta.x / 4) * (event.shiftKey ? 10 : 1);
      const from = scrubFrom.current ?? min ?? 0;
      commit(limit(roundLike(from + steps * step, step, min ?? 0)));
    },
    onEnd: (_, cancelled) => {
      if (cancelled) commit(scrubFrom.current);
      input.current?.focus({ preventScroll: true });
    },
  });

  const atMin = current !== null && min !== undefined && current <= min;
  const atMax = current !== null && max !== undefined && current >= max;
  const integers = Number.isInteger(step) && (min ?? 0) >= 0 && formatOptions?.style !== "percent";

  return (
    <>
      <TextField
        ref={input}
        label={label}
        labelHidden={labelHidden}
        layout={layout}
        width={width}
        description={description}
        error={error}
        size={size}
        variant={variant}
        className={className ? `cy-number-field ${className}` : "cy-number-field"}
        {...(style ? { style } : {})}
        role="spinbutton"
        id={id}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        inputMode={integers ? "numeric" : "decimal"}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-valuenow={ariaNumber(current)}
        aria-valuemin={ariaNumber(min)}
        aria-valuemax={ariaNumber(max)}
        aria-valuetext={current === null ? undefined : spoken(current)}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        form={form}
        value={draft ?? shown(current)}
        onChange={onType}
        onKeyDown={onKeyDown}
        onBlur={commitDraft}
        addonEnd={
          (unit || !hideSteppers) && (
            <>
              {unit && (
                <span className="cy-number-field-unit" aria-hidden="true">
                  {unit}
                </span>
              )}
              {!hideSteppers && (
                <span className="cy-number-field-steppers">
                  <IconButton
                    icon={decrementIcon}
                    label={text.decrement}
                    variant="ghost"
                    size="sm"
                    tabIndex={steppersFocusable ? undefined : -1}
                    disabled={disabled || readOnly || atMin}
                    onClick={() => {
                      const next = stepBy(-step);
                      // A focusable stepper keeps focus, unless it is now disabled at the limit (focus would be lost).
                      if (!steppersFocusable || (next !== null && min !== undefined && next <= min))
                        input.current?.focus();
                    }}
                  />
                  <IconButton
                    icon={incrementIcon}
                    label={text.increment}
                    variant="ghost"
                    size="sm"
                    tabIndex={steppersFocusable ? undefined : -1}
                    disabled={disabled || readOnly || atMax}
                    onClick={() => {
                      const next = stepBy(step);
                      if (!steppersFocusable || (next !== null && max !== undefined && next >= max))
                        input.current?.focus();
                    }}
                  />
                </span>
              )}
            </>
          )
        }
      />
      <HiddenValue
        name={name}
        form={form}
        value={current === null ? "" : plainNumber(current)}
        disabled={disabled}
        onReset={() => {
          setDraft(null);
          resetCurrent(defaultValue);
        }}
      />
    </>
  );
}
