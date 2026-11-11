import type { CSSProperties, ReactNode } from "react";
import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import { useField } from "../../foundations/field.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { check } from "../../icons/check.js";
import { minus } from "../../icons/minus.js";
import type { Size, Tone } from "../../tokens/schema.js";

export interface ChoiceRowProps {
  /** The control's label. Pressing it toggles the control. */
  label: ReactNode;
  /** Help text shown under the label and read with the control. */
  description?: ReactNode | undefined;
  /** Controlled: whether it is on. */
  checked?: boolean | undefined;
  /** On at first, when uncontrolled. */
  defaultChecked?: boolean | undefined;
  /** Called when the person turns it on or off, with the new state. */
  onChange?: ((checked: boolean) => void) | undefined;
  /** Name it is submitted under in a form, when on. */
  name?: string | undefined;
  /** The value submitted with `name` when on. The browser sends "on" when this is not set. */
  value?: string | undefined;
  /** It must be on for the form to submit. */
  required?: boolean | undefined;
  /** It cannot be changed and is not submitted with a form. */
  disabled?: boolean | undefined;
  /** Size of the control and its text. Default "md". */
  size?: Size | undefined;
  /** Fill colour when on. Default "accent". */
  tone?: Tone | undefined;
  /** Id of the native input; one is generated when not set. */
  id?: string | undefined;
  /** Added to the root element (the label that wraps the row), for layout. */
  className?: string | undefined;
  /** Layout only, applied to the root element. */
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
  strike,
  size = "md",
  tone = "accent",
  id,
  className,
  style,
  ...input
}: ChoiceRowProps & {
  kind: "checkbox" | "switch" | "radio";
  indeterminate?: boolean | undefined;
  /** Checkbox only (`strikeWhenChecked`): kept out of `ChoiceRowProps`, so Switch and RadioGroup do not gain it. */
  strike?: boolean | undefined;
}) {
  const field = useField({ id, description });
  return (
    <label
      htmlFor={field.id}
      className={`cy-choice${className ? ` ${className}` : ""}`}
      data-size={size}
      data-tone={tone}
      data-disabled={input.disabled ? "" : undefined}
      data-strike={strike ? "" : undefined}
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
