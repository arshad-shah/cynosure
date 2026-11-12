import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import { useField } from "../../foundations/field.js";
import type { Size, Tone } from "../../tokens/schema.js";

export interface ChoiceTokens {
  gap: string;
  doneColor: string;
  strikeWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    choice: ChoiceTokens;
  }
}

/** The props of a control that sits in a Choice row (Checkbox, Switch). */
export interface ChoiceControlProps {
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

/** What a Choice hands its control: spread it onto the native checkbox or radio (`ChoiceBase`). */
export interface ChoiceInput {
  id: string;
  "aria-labelledby": string;
  "aria-describedby": string | undefined;
  name?: string | undefined;
  value?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface ChoiceProps extends Omit<ChoiceControlProps, "tone"> {
  /**
   * Draws the control, given the props for its native input. The input must be a direct child of the element this
   * returns (the label's strike follows it).
   */
  control: (input: ChoiceInput) => ReactNode;
  /**
   * While the control is checked (and not mixed), the label is struck through and muted, and the description muted,
   * so a done task reads as done. Default false.
   */
  strikeWhenChecked?: boolean | undefined;
}

/**
 * The row a choice control sits in: the control, its label and its description, the whole row clickable. Checkbox,
 * Switch and RadioGroup's options are Choice rows; each draws its own control.
 */
export function Choice({
  control,
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  strikeWhenChecked = false,
  size = "md",
  id,
  className,
  style,
  ...input
}: ChoiceProps) {
  const field = useField({ id, description });
  return (
    <label
      htmlFor={field.id}
      className={`cy-choice${className ? ` ${className}` : ""}`}
      data-size={size}
      data-disabled={input.disabled ? "" : undefined}
      data-strike={strikeWhenChecked ? "" : undefined}
      style={style}
    >
      {control({
        ...input,
        id: field.id,
        "aria-labelledby": field.labelId,
        "aria-describedby": field.describedBy,
        ...(checked !== undefined ? { checked } : { defaultChecked }),
        onChange: (e) => onChange?.(e.currentTarget.checked),
      })}
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
