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

export interface ContextMenuProps {
  /** Render the target: `(props) => <div {...props} tabIndex={0}>…</div>`. Make it focusable for keyboard users. */
  children: (props: ContextMenuTargetProps) => ReactNode;
  /** Accessible name of the menu. */
  label: string;
  /** The commands, as in `Menu`: items, or sections of items with a group name. */
  items: MenuEntry[];
  /** Called when an item is chosen, with its `value`. */
  onSelect: (value: string) => void;
  /** Called when the menu opens or closes, e.g. to highlight the row it belongs to. */
  onOpenChange?: ((open: boolean) => void) | undefined;
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
 * or Shift+F10 / the context menu key on the focused target. The menu itself behaves like `Menu`.
 */
export function ContextMenu({
  children,
  label,
  items,
  onSelect,
  onOpenChange,
  disabled = false,
  className,
  style,
}: ContextMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const target = useRef<HTMLElement>(null);
  const anchor = useRef<HTMLElement | VirtualAnchor | null>(null);
  const press = useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const changed = useRef(onOpenChange);
  changed.current = onOpenChange;

  const show = useCallback((at: HTMLElement | VirtualAnchor) => {
    anchor.current = at;
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    changed.current?.(open);
  }, [open]);

  const cancelPress = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  };
  useEffect(() => cancelPress, []);

  return (
    <>
      {children({
        ref: target,
        "aria-keyshortcuts": "Shift+F10",
        onContextMenu: (event) => {
          if (disabled) return;
          event.preventDefault();
          cancelPress();
          // A keyboard-made contextmenu event has no pointer position: place the menu at the target instead.
          const fromKeyboard = event.clientX === 0 && event.clientY === 0;
          show(fromKeyboard ? event.currentTarget : point(event.clientX, event.clientY));
        },
        onKeyDown: (event) => {
          if (disabled || event.target !== event.currentTarget) return;
          if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) {
            event.preventDefault();
            show(event.currentTarget);
          }
        },
        onPointerDown: (event) => {
          if (disabled || event.pointerType !== "touch") return;
          const { clientX: x, clientY: y } = event;
          cancelPress();
          press.current = { x, y, timer: setTimeout(() => show(point(x, y)), LONG_PRESS) };
        },
        onPointerMove: (event) => {
          const p = press.current;
          if (p && Math.hypot(event.clientX - p.x, event.clientY - p.y) > SLOP) cancelPress();
        },
        onPointerUp: cancelPress,
        onPointerCancel: cancelPress,
      })}
      <MenuPanel
        id={id}
        label={label}
        items={items}
        onSelect={onSelect}
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
