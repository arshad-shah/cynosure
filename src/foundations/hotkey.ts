import { useEffect, useRef } from "react";

/** True on Apple platforms, where `mod` means Command; elsewhere it means Control. */
export const isApple = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

/** Parses "mod+shift+k" into a matcher for keyboard events. */
export function matchesHotkey(combo: string, event: KeyboardEvent): boolean {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop() ?? "";
  const want = new Set(parts.map((p) => (p === "mod" ? (isApple() ? "meta" : "ctrl") : p)));
  return (
    event.key.toLowerCase() === key &&
    event.ctrlKey === want.has("ctrl") &&
    event.metaKey === want.has("meta") &&
    event.altKey === want.has("alt") &&
    event.shiftKey === want.has("shift")
  );
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
