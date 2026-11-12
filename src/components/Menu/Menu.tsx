import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { ariaKeyShortcuts, shortcutKeys } from "../../foundations/hotkey.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isTypeaheadKey, useTypeahead } from "../../foundations/listbox.js";
import { OptionIcon, type OptionIconColor } from "../../foundations/option-icon.js";
import { useRovingFocus } from "../../foundations/roving-focus.js";
import { check } from "../../icons/check.js";
import { chevronRight } from "../../icons/chevron-right.js";
import type { IconData } from "../../icons/types.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { useFloatingOffset, usePopover } from "../../overlay/floating.js";
import type { Placement } from "../../overlay/position.js";
import { useAnchoredPosition, type VirtualAnchor } from "../../overlay/use-anchored-position.js";
import type { Tone } from "../../tokens/schema.js";
import { Kbd, useApple } from "../Kbd/Kbd.js";

export interface MenuTokens {
  minWidth: string;
  maxWidth: string;
  radius: string;
  rowHeight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    menu: MenuTokens;
  }
}

export interface MenuItem extends OptionIconColor {
  value: string;
  label: string;
  /** Icon before the label, muted by default. Colour it with `iconTone` or `iconColor`. */
  icon?: IconData;
  /**
   * Keys shown at the end of the row and exposed as aria-keyshortcuts: ["Ctrl", "E"], or "mod+e" for this platform's
   * names (Cmd on Apple). Display only: bind them yourself (`useHotkey`).
   */
  shortcut?: string[] | string;
  disabled?: boolean;
  tone?: Extract<Tone, "neutral" | "danger">;
  /** Checkable item: a toggle (`checkbox`) or one of a set (`radio`). Checkable items keep the menu open. */
  kind?: "checkbox" | "radio";
  checked?: boolean;
  /** Stay open after choosing. Default: true for checkable items (several toggles in a row), false otherwise. */
  keepOpen?: boolean;
  /**
   * A submenu: the item opens these entries beside it instead of being chosen (its own `value` is never selected).
   * Nest to any depth; `onSelect` receives the value chosen at any level.
   */
  items?: MenuEntry[] | undefined;
}

export interface MenuSection {
  /** Group name (shown and announced). Without one, the section is only set apart by separator lines. */
  label?: string | undefined;
  /** The section's items. */
  items: MenuItem[];
}

export type MenuEntry = MenuItem | MenuSection;

/** Spread onto the trigger (a Button or IconButton). */
export interface MenuTriggerProps {
  /** Spread onto the trigger. The menu is placed against this element and focus returns to it on close. */
  ref: Ref<HTMLButtonElement>;
  /** Spread onto the trigger. Opens the menu, or closes it when it is open. */
  onClick: () => void;
  /** Spread onto the trigger. Arrow Down opens the menu on its first item, Arrow Up on its last. */
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  /** Spread onto the trigger. Whether the menu is open. */
  "aria-expanded": boolean;
  /** Spread onto the trigger. The id of the menu panel. */
  "aria-controls": string;
  /** Spread onto the trigger. Tells assistive technology that it opens a menu. */
  "aria-haspopup": "menu";
}

export interface MenuProps {
  /** Render the trigger: `(props) => <Button {...props}>Actions</Button>`. */
  trigger: (props: MenuTriggerProps) => ReactNode;
  /** Accessible name of the menu. */
  label: string;
  /** The commands: items (an item with `items` opens a submenu), or sections of items, labelled or not. */
  items: MenuEntry[];
  /** Called with the chosen item's `value`, from any level of submenu. */
  onSelect: (value: string) => void;
  /** Whether the menu is open, to open it from elsewhere (a keyboard shortcut). Pair with `onOpenChange`. */
  open?: boolean | undefined;
  /** Open on first render, when `open` is not controlled. Default false. */
  defaultOpen?: boolean | undefined;
  /** Called when the menu opens or closes: the trigger, Escape, a choice, Tab or a click outside. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Side of the trigger the menu opens on. Default "bottom". */
  placement?: Placement;
  /** Added to the menu panel, for layout. */
  className?: string;
  /** Layout only, applied to the panel. */
  style?: CSSProperties;
}

const ITEM = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
/** A section has no `value`; an item with `items` is a submenu, not a section. */
const isSection = (entry: MenuEntry): entry is MenuSection => !("value" in entry);
/** The usable items of one menu panel, not those of the submenus nested in it. */
const ownItems = (menu: Element) =>
  [...menu.querySelectorAll<HTMLElement>(ITEM)].filter(
    (i) => i.closest('[role="menu"]') === menu && i.getAttribute("aria-disabled") !== "true",
  );
/** Resting the pointer on a parent item this long opens its submenu. */
const OPEN_DELAY = 150;
/**
 * While a submenu is open, another item must hold the pointer this long to close or switch it: time to cross other
 * items on the way to the submenu.
 */
const SWITCH_DELAY = 300;

export interface MenuPanelProps {
  id: string;
  label: string;
  items: MenuEntry[];
  onSelect: (value: string) => void;
  open: boolean;
  onClose: () => void;
  /** Closes the whole menu tree (a choice, Tab). Default `onClose`. */
  onCloseAll?: (() => void) | undefined;
  /** Which item takes focus when the panel opens; `none` for a submenu opened by the pointer. */
  focusOn: "first" | "last" | "none";
  /** What the panel is placed against: the trigger, or a point (context menus). */
  anchor: RefObject<HTMLElement | VirtualAnchor | null>;
  placement: Placement;
  offset: number;
  /** Elements that count as inside (clicking them does not dismiss). */
  inside: RefObject<HTMLElement | null>[];
  returnFocus: RefObject<HTMLElement | null>;
  /** How deep in the menu tree: 0 for the menu itself, 1 for its submenus, and so on. */
  depth?: number | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** Internal: the menu list in the top layer, shared by Menu, ContextMenu and Menubar, and nested for submenus. */
export function MenuPanel({
  id,
  label,
  items,
  onSelect,
  open,
  onClose,
  onCloseAll = onClose,
  focusOn,
  anchor,
  placement,
  offset,
  inside,
  returnFocus,
  depth = 0,
  className,
  style,
}: MenuPanelProps) {
  const apple = useApple();
  const panel = useRef<HTMLDivElement>(null);
  const typeTo = useTypeahead();
  // The open submenu (its parent item's value), and a request to focus its first item.
  const [sub, setSub] = useState<string | null>(null);
  const [focusSub, setFocusSub] = useState(0);
  const current = useRef(sub);
  current.current = sub;
  const pending = useRef<{ to: string | null; timer: ReturnType<typeof setTimeout> } | null>(null);
  const rows = useRef(new Map<string, RefObject<HTMLButtonElement | null>>());
  const nested = depth > 0;
  const subOffset = useFloatingOffset(panel, open && nested);

  usePopover(panel, open, (el) => {
    if (focusOn === "none") return;
    const enabled = ownItems(el);
    (focusOn === "last" ? enabled[enabled.length - 1] : enabled[0])?.focus({ preventScroll: true });
  });
  useAnchoredPosition(
    anchor,
    panel,
    open,
    nested ? "end" : placement,
    nested ? subOffset : offset,
    nested ? "flush" : "start",
  );
  useRovingFocus(panel, { orientation: "vertical", selector: ITEM });
  useDismiss({ open, onClose, inside: [...inside, panel], returnFocus });

  const cancel = useCallback(() => {
    if (pending.current) clearTimeout(pending.current.timer);
    pending.current = null;
  }, []);
  // A closed menu has no submenu open; nothing waits to open one.
  useEffect(() => {
    if (open) return;
    cancel();
    setSub(null);
  }, [open, cancel]);
  useEffect(() => cancel, [cancel]);

  const openSub = (value: string) => {
    cancel();
    setSub(value);
    setFocusSub((n) => n + 1);
  };
  const closeSub = useCallback(() => setSub(null), []);
  // After the submenu has shown (its own layout effects run first), move focus to its first item.
  useClientLayoutEffect(() => {
    if (!focusSub) return;
    // A focus request always comes with its submenu open: its parent row and panel are rendered.
    const row = (rows.current.get(sub as string) as RefObject<HTMLButtonElement>).current;
    const menu = (panel.current as HTMLElement).querySelector(`[id="${row.getAttribute("aria-controls")}"]`);
    ownItems(menu as Element)[0]?.focus({ preventScroll: true });
  }, [focusSub]);

  /** The pointer rests on an item: after a delay, open its submenu, or close the open one. */
  const hover = (to: string | null) => {
    if (pending.current?.to === to) return;
    cancel();
    if (to === current.current) return;
    pending.current = {
      to,
      timer: setTimeout(
        () => {
          pending.current = null;
          setSub(to);
        },
        current.current === null ? OPEN_DELAY : SWITCH_DELAY,
      ),
    };
  };
  const onPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const target = event.target as HTMLElement;
    // In a submenu: the pointer made it there, so whatever was about to close it is off.
    if (target.closest('[role="menu"]') !== event.currentTarget) return cancel();
    // Over a plain item, or the padding between items: whatever submenu is open closes.
    hover(target.closest<HTMLElement>(ITEM)?.dataset.submenu ?? null);
  };

  const choose = (item: MenuItem) => {
    if (item.disabled) return;
    if (item.items) return openSub(item.value);
    onSelect(item.value);
    if (!(item.keepOpen ?? !!item.kind)) onCloseAll();
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Keys in a nested submenu are its own.
    const target = event.target as HTMLElement;
    if (target.closest('[role="menu"]') !== event.currentTarget) return;
    // Tab leaves the menu like leaving the button: close the whole tree and let focus move on.
    if (event.key === "Tab") {
      onCloseAll();
      return;
    }
    const rtl = isRtl(event.currentTarget);
    if (event.key === (rtl ? "ArrowLeft" : "ArrowRight") && target.dataset.submenu !== undefined) {
      event.preventDefault();
      openSub(target.dataset.submenu);
      return;
    }
    if (event.key === (rtl ? "ArrowRight" : "ArrowLeft") && nested) {
      // Back to the parent item. Unhandled here, a Menubar moves to its neighbouring menu instead.
      event.preventDefault();
      returnFocus.current?.focus();
      onClose();
      return;
    }
    if (!isTypeaheadKey(event)) return;
    const list = ownItems(event.currentTarget);
    list[
      typeTo(
        event.key,
        list.map((i) => i.dataset.label ?? ""),
        list.indexOf(target),
      )
    ]?.focus();
  };

  const rowRef = (value: string) => {
    let ref = rows.current.get(value);
    if (!ref) {
      ref = { current: null };
      rows.current.set(value, ref);
    }
    return ref;
  };

  let n = 0;
  const row = (item: MenuItem) => {
    const subId = `${id}-${n++}`;
    const parent = !!item.items;
    const ref = parent ? rowRef(item.value) : undefined;
    const expanded = parent && open && sub === item.value;
    const button = (
      <ButtonBase
        key={item.value}
        ref={ref}
        role={
          item.kind && !parent
            ? item.kind === "checkbox"
              ? "menuitemcheckbox"
              : "menuitemradio"
            : "menuitem"
        }
        aria-checked={item.kind && !parent ? !!item.checked : undefined}
        aria-disabled={item.disabled || undefined}
        aria-haspopup={parent ? "menu" : undefined}
        aria-expanded={parent ? expanded : undefined}
        aria-controls={parent ? `${subId}-menu` : undefined}
        aria-keyshortcuts={
          item.shortcut &&
          ariaKeyShortcuts(
            typeof item.shortcut === "string" ? shortcutKeys(item.shortcut, apple) : item.shortcut,
          )
        }
        tabIndex={-1}
        className="cy-menu-item"
        data-tone={item.tone}
        data-label={item.label}
        data-submenu={parent && !item.disabled ? item.value : undefined}
        onClick={() => choose(item)}
      >
        {item.kind && !parent && (
          <span className="cy-menu-check" aria-hidden="true">
            {item.checked && <Icon icon={check} />}
          </span>
        )}
        <OptionIcon option={item} plain={item.disabled} className="cy-menu-icon" />
        <span className="cy-menu-label">{item.label}</span>
        {item.shortcut && (
          <span className="cy-menu-shortcut" aria-hidden="true">
            <Kbd keys={item.shortcut} size="sm" />
          </span>
        )}
        {parent && <Icon icon={chevronRight} flipRtl className="cy-menu-chevron" />}
      </ButtonBase>
    );
    if (!ref) return button;
    return (
      <Fragment key={item.value}>
        {button}
        <MenuPanel
          id={subId}
          label={item.label}
          items={item.items as MenuEntry[]}
          onSelect={onSelect}
          open={expanded}
          onClose={closeSub}
          onCloseAll={onCloseAll}
          focusOn="none"
          anchor={ref}
          placement="end"
          offset={0}
          inside={[ref]}
          returnFocus={ref}
          depth={depth + 1}
        />
      </Fragment>
    );
  };

  const line = (key: string) => <hr key={key} className="cy-menu-separator" />;

  return (
    <div
      ref={panel}
      id={`${id}-menu`}
      role="menu"
      aria-label={label}
      aria-orientation="vertical"
      {...{ popover: "manual" }}
      className={className ? `cy-menu ${className}` : "cy-menu"}
      data-nested={nested ? "" : undefined}
      style={style}
      onKeyDown={onPanelKeyDown}
      onPointerOver={onPointerOver}
      onPointerLeave={cancel}
    >
      {items.map((entry, i) => {
        if (!isSection(entry)) return row(entry);
        if (!entry.label) {
          // An unlabelled section: lines before and after, no group.
          const next = items[i + 1];
          return (
            <Fragment key={`section-${i}`}>
              {i > 0 && line("before")}
              {entry.items.map(row)}
              {next && !isSection(next) && line("after")}
            </Fragment>
          );
        }
        return (
          <Fragment key={`section-${i}`}>
            {i > 0 && line("before")}
            {/* biome-ignore lint/a11y/useSemanticElements: APG menus group items with role="group"; a fieldset is for forms */}
            <div role="group" aria-label={entry.label} className="cy-menu-group">
              <span className="cy-menu-group-label" aria-hidden="true">
                {entry.label}
              </span>
              {entry.items.map(row)}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

/** APG menu button: commands in a top-layer list with arrow keys, type-ahead, sections, submenus and checkable items. */
export function Menu({
  trigger,
  label,
  items,
  onSelect,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
  className,
  style,
}: MenuProps) {
  const id = useId();
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [focusOn, setFocusOn] = useState<"first" | "last">("first");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const show = useCallback(
    (at: "first" | "last") => {
      setFocusOn(at);
      setOpen(true);
    },
    [setOpen],
  );
  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <>
      {trigger({
        ref: triggerRef,
        onClick: () => (open ? close() : show("first")),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            show(event.key === "ArrowUp" ? "last" : "first");
          }
        },
        "aria-expanded": open,
        "aria-controls": `${id}-menu`,
        "aria-haspopup": "menu",
      })}
      <MenuPanel
        id={id}
        label={label}
        items={items}
        onSelect={onSelect}
        open={open}
        onClose={close}
        focusOn={focusOn}
        anchor={triggerRef}
        placement={placement}
        offset={4}
        inside={[triggerRef]}
        returnFocus={triggerRef}
        className={className}
        style={style}
      />
    </>
  );
}
