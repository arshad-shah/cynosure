import { type RefObject, useEffect } from 'react';
import { useCallbackRef } from './useCallbackRef.js';

export interface UseHotkeysOptions {
  /** Event target to attach to. Defaults to `document`. */
  target?: RefObject<HTMLElement | null> | EventTarget | null;
  /** Which event to listen on. Defaults to `"keydown"`. */
  eventType?: 'keydown' | 'keyup';
  /** Fire the hotkey even when focus is in a text field. Default: false. */
  enableOnFormTags?: boolean;
  /** Fire the hotkey when focus is inside a `contenteditable`. Default: false. */
  enableOnContentEditable?: boolean;
  /** Skip matching entirely when `false`. Useful for gating with state. */
  enabled?: boolean;
  /** Call `preventDefault()` when the shortcut fires. Default: true. */
  preventDefault?: boolean;
}

type HotkeyHandler = (event: KeyboardEvent) => void;
type HotkeyInput = string | readonly string[];

const FORM_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const normalizeKey = (key: string): string => {
  const lower = key.toLowerCase().trim();
  if (lower === 'esc') return 'escape';
  if (lower === 'spacebar' || lower === 'space') return ' ';
  if (lower === 'del') return 'delete';
  if (lower === 'return') return 'enter';
  return lower;
};

const parseCombo = (combo: string): Set<string> => {
  const parts = combo
    .split('+')
    .map((part) => normalizeKey(part))
    .filter(Boolean);
  return new Set(parts);
};

const matches = (event: KeyboardEvent, combo: Set<string>): boolean => {
  const pressed = new Set<string>();
  // Authors can spell the "command key" as `mod`, which means Cmd on macOS
  // and Ctrl elsewhere — we collapse both into `mod` when the combo uses it
  // so pressed/combo sizes still line up.
  const comboUsesMod = combo.has('mod');
  if (comboUsesMod) {
    if (event.metaKey || event.ctrlKey) pressed.add('mod');
  } else {
    if (event.ctrlKey) pressed.add('ctrl');
    if (event.metaKey) pressed.add('meta');
  }
  if (event.shiftKey) pressed.add('shift');
  if (event.altKey) pressed.add('alt');
  const key = normalizeKey(event.key);
  if (key !== 'control' && key !== 'meta' && key !== 'shift' && key !== 'alt') {
    pressed.add(key);
  }

  if (combo.size !== pressed.size) return false;
  for (const entry of combo) {
    if (!pressed.has(entry)) return false;
  }
  return true;
};

const shouldSkip = (
  event: KeyboardEvent,
  enableOnFormTags: boolean,
  enableOnContentEditable: boolean,
): boolean => {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  if (!enableOnFormTags && FORM_TAGS.has(target.tagName)) return true;
  if (!enableOnContentEditable && target.isContentEditable) return true;
  return false;
};

const resolveTarget = (target: UseHotkeysOptions['target']): EventTarget | null => {
  if (!target) return typeof document !== 'undefined' ? document : null;
  if ('current' in target) return target.current;
  return target;
};

/**
 * Keyboard shortcut matcher. Accepts a single combo (`"mod+k"`) or a list of
 * combos that should trigger the same handler. Case- and order-insensitive.
 * Use `mod` to match Cmd on macOS and Ctrl elsewhere.
 */
export function useHotkeys(
  keys: HotkeyInput,
  handler: HotkeyHandler,
  options: UseHotkeysOptions = {},
): void {
  const stable = useCallbackRef(handler);
  const {
    target,
    eventType = 'keydown',
    enableOnFormTags = false,
    enableOnContentEditable = false,
    enabled = true,
    preventDefault = true,
  } = options;

  const keyList = Array.isArray(keys) ? keys : [keys as string];
  const normalizedKey = keyList.join('|');

  useEffect(() => {
    if (!enabled) return;
    const eventTarget = resolveTarget(target);
    if (!eventTarget) return;

    const combos = normalizedKey.split('|').map(parseCombo);

    const listener = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (shouldSkip(keyboardEvent, enableOnFormTags, enableOnContentEditable)) return;
      for (const combo of combos) {
        if (matches(keyboardEvent, combo)) {
          if (preventDefault) keyboardEvent.preventDefault();
          stable(keyboardEvent);
          return;
        }
      }
    };

    eventTarget.addEventListener(eventType, listener);
    return () => eventTarget.removeEventListener(eventType, listener);
  }, [
    normalizedKey,
    eventType,
    enableOnFormTags,
    enableOnContentEditable,
    enabled,
    preventDefault,
    target,
    stable,
  ]);
}
