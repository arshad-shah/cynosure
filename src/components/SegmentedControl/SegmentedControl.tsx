import { type CSSProperties, useId } from "react";
import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";
import type { Size, Tone } from "../../tokens/schema.js";

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
  options: SegmentOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Show icons only; labels stay as accessible names. */
  iconOnly?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  size?: Size;
  /** Colour of the active segment's content. */
  tone?: Tone;
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
  const generated = useId();
  const groupName = name ?? `cy-seg-${generated}`;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`cy-segmented${className ? ` ${className}` : ""}`}
      data-size={size}
      data-tone={tone}
      data-full={fullWidth ? "" : undefined}
      data-icon-only={iconOnly ? "" : undefined}
      style={style}
    >
      {options.map((option) => (
        <label
          key={option.value}
          htmlFor={`${groupName}-${option.value}`}
          className="cy-segment"
          data-disabled={disabled || option.disabled ? "" : undefined}
        >
          <ChoiceBase
            id={`${groupName}-${option.value}`}
            type="radio"
            name={groupName}
            value={option.value}
            disabled={disabled || option.disabled}
            aria-label={option.label}
            {...(value !== undefined
              ? { checked: value === option.value }
              : { defaultChecked: defaultValue === option.value })}
            onChange={(e) => e.currentTarget.checked && onChange?.(option.value)}
          />
          {option.icon && <Icon icon={option.icon} />}
          {!iconOnly && <span className="cy-segment-label">{option.label}</span>}
        </label>
      ))}
    </div>
  );
}
