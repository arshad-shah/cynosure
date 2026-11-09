import { ChoiceRow, type ChoiceRowProps } from "../Checkbox/ChoiceRow.js";

export interface SwitchTokens {
  width: string;
  height: string;
  thumbSize: string;
  offBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    switch: SwitchTokens;
  }
}

export type SwitchProps = ChoiceRowProps;

/** On/off switch (`role="switch"`) on a native checkbox. */
export function Switch(props: SwitchProps) {
  return <ChoiceRow kind="switch" {...props} />;
}
