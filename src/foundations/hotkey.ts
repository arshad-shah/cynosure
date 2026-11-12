import { useEffect, useRef } from "react";

/** True on Apple platforms, where `mod` means Command; elsewhere it means Control. */
export const isApple = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

/** The letter or digit printed on the physical key ("KeyK" is "k", "Digit1" is "1"), or "". */
const codeKey = (code: string) => (/^(?:Key[A-Z]|Digit\d)$/.test(code) ? code.slice(-1).toLowerCase() : "");

/**
 * Parses "mod+shift+k" into a matcher for keyboard events. The key is compared with the character typed and, when
 * that is not a letter or digit (Option+K types "˚" on macOS, Shift+1 types "!"), with the physical key. A "+" can be
 * the key itself ("mod++").
 */
export function matchesHotkey(combo: string, event: KeyboardEvent): boolean {
  const parts = combo.toLowerCase().split(/\+(?=.)/);
  const last = parts.pop() ?? "";
  const key = last === "space" ? " " : last;
  const want = new Set(parts.map((p) => (p === "mod" ? (isApple() ? "meta" : "ctrl") : p)));
  const typed = event.key.toLowerCase();
  const hit = typed === key || (!/^[a-z0-9]$/.test(typed) && codeKey(event.code ?? "") === key);
  return (
    hit &&
    event.ctrlKey === want.has("ctrl") &&
    event.metaKey === want.has("meta") &&
    event.altKey === want.has("alt") &&
    event.shiftKey === want.has("shift")
  );
}

/** Keys that only modify another key, or lock a mode: a shortcut waits for the key that follows them. */
const MODIFIER_KEYS =
  /^(?:Control|Shift|Alt|AltGraph|Meta|OS|Hyper|Super|Fn|FnLock|CapsLock|NumLock|ScrollLock|Symbol|SymbolLock)$/;

export interface HotkeyFromEventOptions {
  /** Write for Apple platforms, where Command is `mod` and Control is `ctrl`. Default: this platform. */
  apple?: boolean;
  /** Accept keys without Control, Command or Alt ("k", "shift+/"). Function keys are always accepted. */
  allowBare?: boolean;
}

/**
 * The shortcut a key press makes, written as `useHotkey` reads it ("mod+shift+p"), or null when the press is not one
 * yet: only modifiers held, a key with no name, or (without `allowBare`) a key that types rather than commands. The
 * key is the character typed and, when that is not a letter or digit (Option+K types "˚", Shift+1 types "!", a dead
 * key or another alphabet), the letter or digit printed on the physical key, so `matchesHotkey` matches it again.
 */
export function hotkeyFromEvent(event: KeyboardEvent, options: HotkeyFromEventOptions = {}): string | null {
  const { apple = isApple(), allowBare = false } = options;
  if (MODIFIER_KEYS.test(event.key)) return null;
  const typed = event.key.toLowerCase();
  let key = /^[a-z0-9]$/.test(typed) ? typed : codeKey(event.code) || typed;
  if (key === " ") key = "space";
  if (!key || key === "dead" || key === "unidentified") return null;
  const command = event.ctrlKey || event.metaKey || event.altKey;
  if (!command && !allowBare && !/^f\d{1,2}$/.test(key)) return null;
  const mods = [
    (apple ? event.metaKey : event.ctrlKey) && "mod",
    apple && event.ctrlKey && "ctrl",
    !apple && event.metaKey && "meta",
    event.altKey && "alt",
    event.shiftKey && "shift",
  ].filter(Boolean);
  return [...mods, key].join("+");
}

const editable = (el: Element) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * Calls `handler` when `combo` ("mod+k", "shift+?", "/") is pressed anywhere in the page, shadow roots included.
 * Shortcuts without Ctrl, Command or Alt are ignored while typing in a field, so "/" still types a slash. Any element
 * can opt its subtree out with `data-cy-hotkeys="off"` (a code editor with its own bindings).
 */
export function useHotkey(combo: string | false, handler: (event: KeyboardEvent) => void) {
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    if (!combo) return;
    const plain = !/(^|\+)(mod|ctrl|meta|alt)\+/.test(combo.toLowerCase());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || !matchesHotkey(combo, event)) return;
      const path = event.composedPath().filter((n): n is Element => n instanceof Element);
      if (path.some((el) => el.getAttribute("data-cy-hotkeys") === "off")) return;
      if (plain && path[0] && editable(path[0])) return;
      event.preventDefault();
      latest.current(event);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [combo]);
}

const CAPS: Record<string, [apple: string, other: string]> = {
  mod: ["Cmd", "Ctrl"],
  ctrl: ["Ctrl", "Ctrl"],
  meta: ["Cmd", "Win"],
  alt: ["Option", "Alt"],
  shift: ["Shift", "Shift"],
  escape: ["Esc", "Esc"],
  esc: ["Esc", "Esc"],
  space: ["Space", "Space"],
  arrowup: ["Up", "Up"],
  arrowdown: ["Down", "Down"],
  arrowleft: ["Left", "Left"],
  arrowright: ["Right", "Right"],
};

/**
 * The key caps for a shortcut written as `useHotkey` writes it, named for the platform: "mod+shift+k" is
 * ["Cmd", "Shift", "K"] on Apple platforms and ["Ctrl", "Shift", "K"] elsewhere.
 */
export function shortcutKeys(combo: string, apple = isApple()): string[] {
  // "+" itself can be the key ("mod++"): split on a joining "+" only.
  return combo.split(/\+(?=.)/).map((part) => {
    const caps = CAPS[part.toLowerCase()];
    if (caps) return apple ? caps[0] : caps[1];
    if (part.length === 1 || /^f\d{1,2}$/i.test(part)) return part.toUpperCase();
    return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
  });
}

const ARIA_NAMES: Record<string, string> = {
  Ctrl: "Control",
  Cmd: "Meta",
  Win: "Meta",
  Opt: "Alt",
  Option: "Alt",
  Esc: "Escape",
  Up: "ArrowUp",
  Down: "ArrowDown",
  Left: "ArrowLeft",
  Right: "ArrowRight",
};

/** Key caps as an `aria-keyshortcuts` value: ["Ctrl", "E"] is "Control+E". */
export const ariaKeyShortcuts = (keys: string[]) => keys.map((k) => ARIA_NAMES[k] ?? k).join("+");
