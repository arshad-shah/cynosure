import type { CSSProperties, ReactNode } from "react";
import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import { useField } from "../../foundations/field.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { check } from "../../icons/check.js";
import { minus } from "../../icons/minus.js";
import type { Size, Tone } from "../../tokens/schema.js";

export interface ChoiceRowProps {
  label: ReactNode;
  description?: ReactNode | undefined;
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  onChange?: ((checked: boolean) => void) | undefined;
  name?: string | undefined;
  value?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  size?: Size | undefined;
  tone?: Tone | undefined;
  id?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** Shared row for Checkbox and Switch: a native checkbox over a drawn control, with a fully clickable label. */
export function ChoiceRow({
  kind,
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  indeterminate,
  size = "md",
  tone = "accent",
  id,
  className,
  style,
  ...input
}: ChoiceRowProps & { kind: "checkbox" | "switch" | "radio"; indeterminate?: boolean | undefined }) {
  const field = useField({ id, description });
  return (
    <label
      htmlFor={field.id}
      className={`cy-choice${className ? ` ${className}` : ""}`}
      data-size={size}
      data-tone={tone}
      data-disabled={input.disabled ? "" : undefined}
      style={style}
    >
      <span className={`cy-${kind}`}>
        <ChoiceBase
          {...input}
          id={field.id}
          type={kind === "radio" ? "radio" : "checkbox"}
          role={kind === "switch" ? "switch" : undefined}
          indeterminate={indeterminate ?? false}
          aria-labelledby={field.labelId}
          aria-describedby={field.describedBy}
          {...(checked !== undefined ? { checked } : { defaultChecked })}
          onChange={(e) => onChange?.(e.currentTarget.checked)}
        />
        {kind === "checkbox" ? (
          <>
            <Icon icon={check} className="cy-checkbox-mark" />
            <Icon icon={minus} className="cy-checkbox-dash" />
          </>
        ) : kind === "switch" ? (
          <span className="cy-reset cy-switch-thumb" />
        ) : null}
      </span>
      <span className="cy-choice-text">
        <span id={field.labelId} className="cy-choice-label">
          {label}
        </span>
        {description && (
          <span id={field.descriptionId} className="cy-choice-description">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
