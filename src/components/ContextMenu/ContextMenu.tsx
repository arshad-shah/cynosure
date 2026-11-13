import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { VirtualAnchor } from "../../overlay/use-anchored-position.js";
import { type MenuEntry, MenuPanel } from "../Menu/Menu.js";

/** Spread onto the one element that opens the menu (a row, a card, a canvas). */
export interface ContextMenuTargetProps {
  /** Spread onto the target: focus returns to it when the menu closes. */
  ref: Ref<HTMLElement>;
  /** Spread onto the target: opens the menu on right-click, in place of the browser's own menu. */
  onContextMenu: (event: MouseEvent<HTMLElement>) => void;
  /** Spread onto the target: opens the menu on Shift+F10 or the context menu key while the target has focus. */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  /** Spread onto the target: starts the long press that opens the menu on touch screens. */
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  /** Spread onto the target: cancels the long press when the finger moves (a scroll). */
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  /** Spread onto the target: cancels the long press when the finger lifts early. */
  onPointerUp: () => void;
  /** Spread onto the target: cancels the long press when the browser takes over the touch. */
  onPointerCancel: () => void;
  /** Spread onto the target: tells assistive tech that Shift+F10 opens the menu. */
  "aria-keyshortcuts": "Shift+F10";
}

/**
 * The props for one of many targets (`targetFor(key)`): the same handlers without the ref. The menu returns focus to
 * the element that opened it.
 */
export type ContextMenuKeyTargetProps = Omit<ContextMenuTargetProps, "ref">;

export interface ContextMenuProps<K = undefined> {
  /**
   * Render the target: `(props) => <div {...props} tabIndex={0}>…</div>`. Make it focusable for keyboard users. For
   * many targets (the rows of a list, the tabs of a tab list), spread `targetFor(key)` onto each instead, with a key
   * (any value, such as the row's item) that `label`, `items`, `onSelect` and `onOpenChange` receive back. One menu
   * then serves them all, beside the list rather than inside it.
   */
  children: (props: ContextMenuTargetProps, targetFor: (key: K) => ContextMenuKeyTargetProps) => ReactNode;
  /** Accessible name of the menu; with many targets, a function of the key of the target it opened for. */
  label: string | ((key: K) => string);
  /**
   * The commands, as in `Menu`: items, or sections of items with a group name. With many targets, a function of the
   * key of the target it opened for.
   */
  items: MenuEntry[] | ((key: K) => MenuEntry[]);
  /** Called when an item is chosen, with its `value` (and, with many targets, the key of the target). */
  onSelect: (value: string, key: K) => void;
  /** Called when the menu opens or closes, e.g. to highlight the row it belongs to (with many targets, its key). */
  onOpenChange?: ((open: boolean, key: K) => void) | undefined;
  /** The browser's own menu shows instead. */
  disabled?: boolean;
  /** Added to the menu panel, for layout. */
  className?: string;
  /** Layout only, applied to the panel. */
  style?: CSSProperties;
}

/** How long a touch must stay down to open the menu (iOS fires no contextmenu event). */
const LONG_PRESS = 500;
/** How far a touch may drift before it counts as a scroll instead of a long press. */
const SLOP = 10;

const point = (x: number, y: number): VirtualAnchor => ({
  getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
});

/**
 * A menu of commands for one thing, opened where the person points: right-click, a long press on touch screens,
 * or Shift+F10 / the context menu key on the focused target. The menu itself behaves like `Menu`. One ContextMenu
 * can serve many targets (rows, tabs) through `targetFor`.
 */
export function ContextMenu<K = undefined>({
  children,
  label,
  items,
  onSelect,
  onOpenChange,
  disabled = false,
  className,
  style,
}: ContextMenuProps<K>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  // The target the menu is open for (or was last open for), by its key; focus returns to its element.
  const [current, setCurrent] = useState<{ key: K; keyed: boolean } | null>(null);
  const target = useRef<HTMLElement>(null);
  const anchor = useRef<HTMLElement | VirtualAnchor | null>(null);
  const press = useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const latest = useRef({ disabled, onOpenChange, current });
  latest.current = { disabled, onOpenChange, current };

  const show = useCallback((key: K, keyed: boolean, el: HTMLElement, at: HTMLElement | VirtualAnchor) => {
    target.current = el;
    anchor.current = at;
    setCurrent({ key, keyed });
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const { onOpenChange, current } = latest.current;
    if (current?.keyed) onOpenChange?.(open, current.key);
    else (onOpenChange as ((open: boolean) => void) | undefined)?.(open);
  }, [open]);

  const cancelPress = useCallback(() => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  }, []);
  useEffect(() => cancelPress, [cancelPress]);

  // Stable, so rows that are memoised do not re-render; the handlers read `disabled` when they run.
  const handlers = useCallback(
    (key: K, keyed: boolean): ContextMenuKeyTargetProps => ({
      "aria-keyshortcuts": "Shift+F10",
      onContextMenu: (event) => {
        if (latest.current.disabled) return;
        event.preventDefault();
        cancelPress();
        // A keyboard-made contextmenu event has no pointer position: place the menu at the target instead.
        const fromKeyboard = event.clientX === 0 && event.clientY === 0;
        const el = event.currentTarget;
        show(key, keyed, el, fromKeyboard ? el : point(event.clientX, event.clientY));
      },
      onKeyDown: (event) => {
        if (latest.current.disabled || event.target !== event.currentTarget) return;
        if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) {
          event.preventDefault();
          show(key, keyed, event.currentTarget, event.currentTarget);
        }
      },
      onPointerDown: (event) => {
        if (latest.current.disabled || event.pointerType !== "touch") return;
        const { clientX: x, clientY: y, currentTarget: el } = event;
        cancelPress();
        press.current = { x, y, timer: setTimeout(() => show(key, keyed, el, point(x, y)), LONG_PRESS) };
      },
      onPointerMove: (event) => {
        const p = press.current;
        if (p && Math.hypot(event.clientX - p.x, event.clientY - p.y) > SLOP) cancelPress();
      },
      onPointerUp: cancelPress,
      onPointerCancel: cancelPress,
    }),
    [show, cancelPress],
  );
  const targetFor = useCallback((key: K) => handlers(key, true), [handlers]);

  const key = current?.key as K;
  const choose = (value: string) => {
    if (current?.keyed) onSelect(value, key);
    else (onSelect as (value: string) => void)(value);
  };
  return (
    <>
      {children({ ref: target, ...handlers(undefined as K, false) }, targetFor)}
      <MenuPanel
        id={id}
        label={typeof label === "function" ? (current ? label(key) : "") : label}
        items={typeof items === "function" ? (current ? items(key) : []) : items}
        onSelect={choose}
        open={open}
        onClose={close}
        focusOn="first"
        anchor={anchor}
        placement="bottom"
        offset={2}
        inside={[]}
        returnFocus={target}
        className={className}
        style={style}
      />
    </>
  );
}
