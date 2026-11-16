import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import { useField } from "../../foundations/field.js";
import type { Size, Tone } from "../../tokens/schema.js";

export interface ChoiceTokens {
  mediaBackground: string;
  mediaMinHeight: string;
  cardCheckedBackground: string;
  cardRadius: string;
  cardPadding: string;
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
  /**
   * Keep the label for assistive tech but take no space (a grid cell, a row whose heading says what it is). Prefer
   * visible labels. Default false.
   */
  labelHidden?: boolean | undefined;
  /** Help text shown under the label and read with the control. */
  description?: ReactNode | undefined;
  /** Controlled: whether it is on. */
  checked?: boolean | undefined;
  /** On at first, when uncontrolled. */
  defaultChecked?: boolean | undefined;
  /**
   * Called when the person turns it on or off, with the new state and the change event. For a checkbox or switch the
   * event's `nativeEvent` is the click that toggled it, so `event.nativeEvent.shiftKey` tells a Shift+click (range
   * selection) from a plain one.
   */
  onChange?: ((checked: boolean, event: ChangeEvent<HTMLInputElement>) => void) | undefined;
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
  /** Ids of the element(s) that name the control instead of its label (a column heading). Pair with `labelHidden`. */
  "aria-labelledby"?: string | undefined;
  /** Ids of more elements that describe the control, read before its own description. */
  "aria-describedby"?: string | undefined;
  /**
   * The input's tab order: `-1` takes it out of the Tab sequence while it stays focusable, for a grid or list that
   * moves focus itself (roving tabindex). Default: in the sequence.
   */
  tabIndex?: number | undefined;
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
  tabIndex?: number | undefined;
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
  /**
   * `"card"`: a bordered card with `media` above the label, chosen-looking (accent border and soft background) while
   * its control is checked. The control should hide its look (RadioGroup's cards keep the native radio, visually
   * hidden). Default `"row"`.
   */
  variant?: "row" | "card" | undefined;
  /** The card's picture (a font sample, a thumbnail, a swatch), above the label. Only with `variant="card"`. */
  media?: ReactNode;
}

/**
 * The row a choice control sits in: the control, its label and its description, the whole row clickable. Checkbox,
 * Switch and RadioGroup's options are Choice rows; each draws its own control.
 */
export function Choice({
  control,
  label,
  labelHidden = false,
  description,
  checked,
  defaultChecked,
  onChange,
  strikeWhenChecked = false,
  variant = "row",
  media,
  size = "md",
  id,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  className,
  style,
  ...input
}: ChoiceProps) {
  const field = useField({ id, description, describedBy });
  return (
    <label
      htmlFor={field.id}
      className={`cy-choice${className ? ` ${className}` : ""}`}
      data-size={size}
      data-disabled={input.disabled ? "" : undefined}
      data-strike={strikeWhenChecked ? "" : undefined}
      data-variant={variant === "card" ? "card" : undefined}
      style={style}
    >
      {control({
        ...input,
        id: field.id,
        "aria-labelledby": labelledBy ?? field.labelId,
        "aria-describedby": field.describedBy,
        ...(checked !== undefined ? { checked } : { defaultChecked }),
        onChange: (e) => onChange?.(e.currentTarget.checked, e),
      })}
      {variant === "card" && media !== undefined && <span className="cy-choice-media">{media}</span>}
      <span className={labelHidden ? "cy-choice-text cy-visually-hidden" : "cy-choice-text"}>
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
