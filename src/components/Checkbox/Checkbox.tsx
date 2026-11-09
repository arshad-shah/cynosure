import { ChoiceRow, type ChoiceRowProps } from "./ChoiceRow.js";

export interface CheckboxTokens {
  size: string;
  radius: string;
  border: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    checkbox: CheckboxTokens;
  }
}

export interface CheckboxProps extends ChoiceRowProps {
  /** Mixed state (announced as "mixed"), e.g. a partially selected "select all". */
  indeterminate?: boolean;
}

/** Checkbox on a native input: forms, reset, required and keyboard come for free. */
export function Checkbox(props: CheckboxProps) {
  return <ChoiceRow kind="checkbox" {...props} />;
}
