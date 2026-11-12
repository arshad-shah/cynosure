import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import { Choice, type ChoiceControlProps } from "../Choice/Choice.js";

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

export type SwitchProps = ChoiceControlProps;

/** On/off switch (`role="switch"`) on a native checkbox, in a Choice row. */
export function Switch({ size = "md", tone = "accent", ...props }: SwitchProps) {
  return (
    <Choice
      {...props}
      size={size}
      control={(input) => (
        <span className="cy-switch" data-size={size} data-tone={tone}>
          <ChoiceBase {...input} type="checkbox" role="switch" />
          <span className="cy-reset cy-switch-thumb" />
        </span>
      )}
    />
  );
}
