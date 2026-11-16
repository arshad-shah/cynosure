import type { ReactNode } from "react";
import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { check } from "../../icons/check.js";
import { minus } from "../../icons/minus.js";
import { Choice, type ChoiceControlProps } from "../Choice/Choice.js";

export interface CheckboxTokens {
  size: string;
  radius: string;
  border: string;
  doneColor: string;
  strikeWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    checkbox: CheckboxTokens;
  }
}

export interface CheckboxProps extends ChoiceControlProps {
  /** Mixed state (announced as "mixed"), e.g. a partially selected "select all". */
  indeterminate?: boolean;
  /**
   * Checklist style: while the box is checked, the label is struck through and muted (and the description muted), so
   * a done task reads as done. Not applied while `indeterminate`. Default false.
   */
  strikeWhenChecked?: boolean;
  /**
   * `"card"`: a bordered card with `media` above the label, for ticking by picture (pages of a document, photos). The
   * whole card, picture included, toggles the box, which is drawn in the picture's top end corner; a ticked card has
   * the accent border and soft background. Default `"row"`.
   */
  variant?: "row" | "card" | undefined;
  /** The card's picture (a page thumbnail, a photo), above the label. Only with `variant="card"`. */
  media?: ReactNode;
}

/** Checkbox on a native input, in a Choice row: forms, reset, required and keyboard come for free. */
export function Checkbox({
  indeterminate = false,
  strikeWhenChecked = false,
  size = "md",
  tone = "accent",
  variant = "row",
  media,
  className,
  ...props
}: CheckboxProps) {
  const pictured = variant === "card" && media !== undefined;
  return (
    <Choice
      {...props}
      size={size}
      strikeWhenChecked={strikeWhenChecked}
      {...(variant === "card" ? { variant, media } : {})}
      // The row carries the checkbox's own class too: it maps the checkbox's done tokens onto the row's, and a pictured
      // card places the box over its picture.
      className={`cy-checkbox-row${pictured ? " cy-checkbox-card" : ""}${className ? ` ${className}` : ""}`}
      control={(input) => (
        <span className="cy-checkbox" data-size={size} data-tone={tone}>
          <ChoiceBase {...input} type="checkbox" indeterminate={indeterminate} />
          <Icon icon={check} className="cy-checkbox-mark" />
          <Icon icon={minus} className="cy-checkbox-dash" />
        </span>
      )}
    />
  );
}
