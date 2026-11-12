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
}

/** Checkbox on a native input, in a Choice row: forms, reset, required and keyboard come for free. */
export function Checkbox({
  indeterminate = false,
  strikeWhenChecked = false,
  size = "md",
  tone = "accent",
  className,
  ...props
}: CheckboxProps) {
  return (
    <Choice
      {...props}
      size={size}
      strikeWhenChecked={strikeWhenChecked}
      // The row carries the checkbox's own class too: it maps the checkbox's done tokens onto the row's.
      className={`cy-checkbox-row${className ? ` ${className}` : ""}`}
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
