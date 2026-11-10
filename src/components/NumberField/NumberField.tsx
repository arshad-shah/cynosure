import { type CSSProperties, type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { clamp } from "../../foundations/math.js";
import { minus } from "../../icons/minus.js";
import { plus } from "../../icons/plus.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";
import { TextField } from "../TextField/TextField.js";

export interface NumberFieldLabels {
  /** Stepper button names. Defaults: "Decrease", "Increase". */
  decrement: string;
  increment: string;
}

export interface NumberFieldProps {
  label: ReactNode;
  labelHidden?: boolean | undefined;
  description?: ReactNode;
  error?: ReactNode;
  /** `null` is empty. */
  value?: number | null | undefined;
  defaultValue?: number | null;
  /** Called with the new value when it is committed: a step, Enter, or leaving the field. */
  onChange?: ((value: number | null) => void) | undefined;
  min?: number | undefined;
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
  name?: string | undefined;
  form?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  placeholder?: string | undefined;
  size?: Size;
  variant?: "outline" | "soft";
  labels?: Partial<NumberFieldLabels>;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: NumberFieldLabels = { decrement: "Decrease", increment: "Increase" };

/** Decimal places of `n`, so stepping by 0.1 gives 0.3 and not 0.30000000000000004. */
const places = (n: number) => (String(n).split(".")[1] ?? "").length;

/** Reads what a person typed in `locale`: group separators, the local decimal mark, a typographic minus, a % or a currency. */
export function parseNumber(
  text: string,
  locale?: string,
  options?: Intl.NumberFormatOptions,
): number | null {
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const cleaned = text
    .replace(/[−‒–]/g, "-")
    .split(group)
    .join(group.trim() ? "" : group)
    .replace(/\s/g, "")
    .split(decimal)
    .join(".")
    .replace(/[^\d.-]/g, "");
  if (!/^-?\d*\.?\d+$|^-?\d+\.?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return options?.style === "percent" ? n / 100 : n;
}

/**
 * A number input: type it in your own format, or step it with the arrow keys, Page Up/Down, Home/End or the − and +
 * buttons. APG spinbutton; locale-aware; takes part in forms with the plain number.
 */
export function NumberField({
  label,
  labelHidden,
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
  name,
  form,
  required,
  disabled,
  readOnly,
  placeholder,
  size = "md",
  variant = "outline",
  labels,
  className,
  style,
}: NumberFieldProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const controlled = value !== undefined;
  const [own, setOwn] = useState<number | null>(defaultValue);
  const current = controlled ? value : own;
  const [draft, setDraft] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const format = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 20, ...formatOptions }),
    [locale, formatOptions],
  );
  const shown = (n: number | null) => (n === null ? "" : format.format(n));

  const limit = (n: number) => clamp(n, min ?? Number.NEGATIVE_INFINITY, max ?? Number.POSITIVE_INFINITY);
  const commit = (next: number | null) => {
    setDraft(null);
    if (next === current) return;
    if (!controlled) setOwn(next);
    onChange?.(next);
  };
  const stepBy = (delta: number) => {
    if (disabled || readOnly) return;
    const base = min ?? 0;
    const from = draft !== null ? (parseNumber(draft, locale, formatOptions) ?? current) : current;
    const start = from ?? (delta > 0 ? (min ?? 0) : (max ?? 0));
    // Snap onto the step grid (counted from min), then round away floating-point noise.
    const snapped = from === null ? start : Math.round((start - base + delta) / step) * step + base;
    const digits = Math.max(places(step), places(base));
    commit(limit(Number(snapped.toFixed(digits))));
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

  const atMin = current !== null && min !== undefined && current <= min;
  const atMax = current !== null && max !== undefined && current >= max;
  const integers = Number.isInteger(step) && (min ?? 0) >= 0 && formatOptions?.style !== "percent";

  return (
    <>
      <TextField
        ref={input}
        label={label}
        labelHidden={labelHidden}
        description={description}
        error={error}
        size={size}
        variant={variant}
        className={className ? `cy-number-field ${className}` : "cy-number-field"}
        {...(style ? { style } : {})}
        role="spinbutton"
        inputMode={integers ? "numeric" : "decimal"}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-valuenow={current ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={current === null ? undefined : shown(current)}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        form={form}
        value={draft ?? shown(current)}
        onChange={setDraft}
        onKeyDown={onKeyDown}
        onBlur={commitDraft}
        addonEnd={
          !hideSteppers && (
            <span className="cy-number-field-steppers">
              <IconButton
                icon={minus}
                label={text.decrement}
                variant="ghost"
                size="sm"
                tabIndex={-1}
                disabled={disabled || readOnly || atMin}
                onClick={() => {
                  stepBy(-step);
                  input.current?.focus();
                }}
              />
              <IconButton
                icon={plus}
                label={text.increment}
                variant="ghost"
                size="sm"
                tabIndex={-1}
                disabled={disabled || readOnly || atMax}
                onClick={() => {
                  stepBy(step);
                  input.current?.focus();
                }}
              />
            </span>
          )
        }
      />
      <HiddenValue
        name={name}
        form={form}
        value={current === null ? "" : String(current)}
        disabled={disabled}
        onReset={() => {
          setDraft(null);
          if (!controlled) setOwn(defaultValue);
        }}
      />
    </>
  );
}
