import { type CSSProperties, Fragment } from "react";
import type { Size } from "../../tokens/schema.js";

export interface KbdTokens {
  radius: string;
  bg: string;
  border: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    kbd: KbdTokens;
  }
}

const SPOKEN: Record<string, string> = {
  ctrl: "Control",
  control: "Control",
  cmd: "Command",
  command: "Command",
  meta: "Command",
  alt: "Alt",
  option: "Option",
  opt: "Option",
  shift: "Shift",
  enter: "Enter",
  return: "Return",
  esc: "Escape",
  escape: "Escape",
  tab: "Tab",
  space: "Space",
  backspace: "Backspace",
  delete: "Delete",
  up: "Up arrow",
  down: "Down arrow",
  left: "Left arrow",
  right: "Right arrow",
};

export interface KbdProps {
  /** Keys in order, e.g. ["Ctrl", "K"]. */
  keys: string[];
  size?: Size;
  /** Override the spoken text (default "Control plus K"). */
  label?: string;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Keyboard shortcut: drawn key caps for sight, a spoken combination for screen readers. */
export function Kbd({ keys, size = "md", label, className, style }: KbdProps) {
  const spoken = label ?? keys.map((k) => SPOKEN[k.toLowerCase()] ?? k).join(" plus ");
  return (
    <kbd className={`cy-kbd${className ? ` ${className}` : ""}`} data-size={size} style={style}>
      <span aria-hidden="true" className="cy-reset cy-kbd-keys">
        {keys.map((key, i) => (
          <Fragment key={`${key}-${i}`}>
            {i > 0 && <span className="cy-kbd-join" />}
            <kbd className="cy-kbd-key">{key}</kbd>
          </Fragment>
        ))}
      </span>
      <span className="cy-visually-hidden">{spoken}</span>
    </kbd>
  );
}
