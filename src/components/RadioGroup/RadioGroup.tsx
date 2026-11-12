import { type CSSProperties, type ReactNode, useId } from "react";
import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { Choice } from "../Choice/Choice.js";
import { Field } from "../Field/Field.js";

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Names the group, shown above the options. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the options. */
  description?: ReactNode;
  /** Error message shown below the options and announced. */
  error?: ReactNode;
  /** The choices: `{ value, label, description?, disabled? }`. */
  options: RadioOption[];
  /** Native group name (generated when omitted). */
  name?: string;
  /** Controlled selected value. */
  value?: string;
  /** Selected value at first, when uncontrolled. */
  defaultValue?: string | undefined;
  /** Called with the option's value when it is chosen. */
  onChange?: (value: string) => void;
  /** Stack the options, or lay them in a row that wraps. Default "vertical". */
  orientation?: "vertical" | "horizontal";
  /** The form will not submit until an option is chosen; also draws the required marker. */
  required?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Size of the radios and their text. Default "md". */
  size?: Size;
  /** Colour of the chosen radio. Default "accent". */
  tone?: Tone;
  /** Added to the root element, for layout. */
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
            <Choice
              key={option.value}
              label={option.label}
              description={option.description}
              name={groupName}
              value={option.value}
              required={required}
              disabled={disabled || option.disabled}
              size={size}
              {...(value !== undefined
                ? { checked: value === option.value }
                : { defaultChecked: defaultValue === option.value })}
              onChange={(checked) => checked && onChange?.(option.value)}
              control={(input) => (
                <span className="cy-radio-group-radio" data-size={size} data-tone={tone}>
                  <ChoiceBase {...input} type="radio" />
                </span>
              )}
            />
          ))}
        </div>
      )}
    </Field>
  );
}
