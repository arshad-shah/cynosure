import { type CSSProperties, Fragment, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { isApple, shortcutKeys } from "../../foundations/hotkey.js";
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
  win: "Windows",
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
  /**
   * Keys in order, e.g. ["Ctrl", "K"]; or a shortcut as `useHotkey` writes it ("mod+k"), shown with this platform's
   * names (Cmd on Apple, Ctrl elsewhere) and hidden on touch-only screens, where a shortcut means nothing.
   */
  keys: string[] | string;
  /** Size of the key caps. Default "md". */
  size?: Size;
  /** Override the spoken text (default "Control plus K"). */
  label?: string;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Keyboard shortcut: drawn key caps for sight, a spoken combination for screen readers. */
export function Kbd({ keys, size = "md", label, className, style }: KbdProps) {
  const apple = useApple();
  const caps = typeof keys === "string" ? shortcutKeys(keys, apple) : keys;
  const spoken = label ?? caps.map((k) => SPOKEN[k.toLowerCase()] ?? k).join(" plus ");
  return (
    <kbd
      className={`cy-kbd${className ? ` ${className}` : ""}`}
      data-size={size}
      data-shortcut={typeof keys === "string" || undefined}
      style={style}
    >
      <span aria-hidden="true" className="cy-reset cy-kbd-keys">
        {caps.map((key, i) => (
          <Fragment key={`${key}-${i}`}>
            {i > 0 && <span className="cy-reset cy-kbd-join" />}
            <kbd className="cy-kbd-key">{key}</kbd>
          </Fragment>
        ))}
      </span>
      <span className="cy-visually-hidden">{spoken}</span>
    </kbd>
  );
}

/** Apple or not, decided after hydration so the server and the first client render agree. */
export function useApple() {
  const [apple, setApple] = useState(false);
  useClientLayoutEffect(() => setApple(isApple()), []);
  return apple;
}
