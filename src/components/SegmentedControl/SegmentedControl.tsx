import { type CSSProperties, useId } from "react";
import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import { useControllableState } from "../../foundations/controllable.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { iconSizeFor } from "../../foundations/icon-size.js";
import type { IconData } from "../../icons/types.js";
import type { DenseSize, Tone } from "../../tokens/schema.js";

export interface SegmentedControlTokens {
  radius: string;
  trackBg: string;
  activeBg: string;
  padding: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    segmentedControl: SegmentedControlTokens;
  }
}

export interface SegmentOption {
  value: string;
  /** Visible text, and always the accessible name (also for icon-only segments). */
  label: string;
  icon?: IconData;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Accessible name of the group. */
  label: string;
  /** The segments: `{ value, label, icon?, disabled? }`. */
  options: SegmentOption[];
  /** Submits the value with its form under this name. Two controls may share a name and stay independent. */
  name?: string;
  /** Controlled selected value. */
  value?: string;
  /** Selected value at first, when uncontrolled. */
  defaultValue?: string;
  /** Called with the segment's value when it is chosen. */
  onChange?: (value: string) => void;
  /** Show icons only; labels stay as accessible names. */
  iconOnly?: boolean;
  /** Stretch to the full width of the container. */
  fullWidth?: boolean;
  /** Disables every segment; the value is not submitted. */
  disabled?: boolean;
  /**
   * Height and text size of the segments. Default "md". `xs` (about 20px) is for dense desktop chrome: each segment is
   * still 24px to press (44px on coarse pointers).
   */
  size?: DenseSize;
  /** Colour of the active segment's content. */
  tone?: Tone;
  /** Added to the root element, for layout. */
  className?: string | undefined;
  /** Layout only. */
  style?: CSSProperties | undefined;
}

/** A compact single choice (view switchers, modes) on native radios. */
export function SegmentedControl({
  label,
  options,
  name,
  value,
  defaultValue,
  onChange,
  iconOnly = false,
  fullWidth = false,
  disabled,
  size = "md",
  tone = "neutral",
  className,
  style,
}: SegmentedControlProps) {
  // The radios are grouped under a name of the control's own, never the caller's: two controls given the same
  // `name` (rows of a list, two panels) would otherwise be one native radio group with clashing ids, and choosing in
  // one would clear the other. The caller's `name` submits the value through a hidden field instead.
  const groupName = `cy-seg-${useId()}`;
  const [current, setCurrent, reset] = useControllableState<string, string | undefined>(
    value,
    defaultValue,
    onChange,
  );
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`cy-segmented-control${className ? ` ${className}` : ""}`}
      data-size={size}
      data-tone={tone}
      data-full={fullWidth ? "" : undefined}
      data-icon-only={iconOnly ? "" : undefined}
      style={style}
    >
      {/* Always present, so a form's reset restores the default; it submits only when there is a name and a value. */}
      <HiddenValue
        name={name}
        value={current ?? ""}
        disabled={disabled || current === undefined}
        onReset={() => reset(defaultValue)}
      />
      {options.map((option) => (
        <label
          key={option.value}
          htmlFor={`${groupName}-${option.value}`}
          className="cy-segmented-control-segment"
          data-disabled={disabled || option.disabled ? "" : undefined}
        >
          <ChoiceBase
            id={`${groupName}-${option.value}`}
            type="radio"
            name={groupName}
            // Belongs to no form: the hidden field above submits the value under the caller's name.
            form=""
            value={option.value}
            disabled={disabled || option.disabled}
            aria-label={option.label}
            checked={current === option.value}
            onChange={(e) => e.currentTarget.checked && setCurrent(option.value)}
          />
          {option.icon && <Icon icon={option.icon} size={iconSizeFor(size)} />}
          {!iconOnly && <span className="cy-segmented-control-label">{option.label}</span>}
        </label>
      ))}
    </div>
  );
}
