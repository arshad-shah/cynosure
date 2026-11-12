import { ChoiceRow, type ChoiceRowProps } from "./ChoiceRow.js";

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

export interface CheckboxProps extends ChoiceRowProps {
  /** Mixed state (announced as "mixed"), e.g. a partially selected "select all". */
  indeterminate?: boolean;
  /**
   * Checklist style: while the box is checked, the label is struck through and muted (and the description muted), so
   * a done task reads as done. Not applied while `indeterminate`. Default false.
   */
  strikeWhenChecked?: boolean;
}

/** Checkbox on a native input: forms, reset, required and keyboard come for free. */
export function Checkbox({ strikeWhenChecked = false, ...props }: CheckboxProps) {
  return <ChoiceRow kind="checkbox" strike={strikeWhenChecked} {...props} />;
}
