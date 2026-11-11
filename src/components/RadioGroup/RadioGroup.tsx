import { type CSSProperties, type ReactNode, useId } from "react";
import type { Size, Tone } from "../../tokens/schema.js";
import { ChoiceRow } from "../Checkbox/ChoiceRow.js";
import { Field } from "../Field/Field.js";

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  description?: ReactNode;
  error?: ReactNode;
  options: RadioOption[];
  /** Native group name (generated when omitted). */
  name?: string;
  value?: string;
  defaultValue?: string | undefined;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  required?: boolean;
  disabled?: boolean;
  size?: Size;
  tone?: Tone;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** One choice from a list, on native radios: arrows, wrap, disabled skipping, RTL, forms and reset are native. */
export function RadioGroup({
  label,
  labelHidden,
  description,
  error,
  options,
  name,
  value,
  defaultValue,
  onChange,
  orientation = "vertical",
  required,
  disabled,
  size = "md",
  tone = "accent",
  className,
  style,
}: RadioGroupProps) {
  const generated = useId();
  const groupName = name ?? `cy-radio-${generated}`;
  return (
    <Field
      group
      label={label}
      labelHidden={labelHidden}
      description={description}
      error={error}
      required={required}
      size={size}
      className={className}
      style={style}
    >
      {() => (
        <div className="cy-radio-group" data-orientation={orientation}>
          {options.map((option) => (
            <ChoiceRow
              key={option.value}
              kind="radio"
              label={option.label}
              description={option.description}
              name={groupName}
              value={option.value}
              required={required}
              disabled={disabled || option.disabled}
              size={size}
              tone={tone}
              {...(value !== undefined
                ? { checked: value === option.value }
                : { defaultChecked: defaultValue === option.value })}
              onChange={(checked) => checked && onChange?.(option.value)}
            />
          ))}
        </div>
      )}
    </Field>
  );
}
