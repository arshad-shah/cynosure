import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { ariaKeyShortcuts, shortcutKeys } from "../../foundations/hotkey.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isTypeaheadKey, useTypeahead } from "../../foundations/listbox.js";
import { OptionIcon, type OptionIconColor } from "../../foundations/option-icon.js";
import { useRovingFocus } from "../../foundations/roving-focus.js";
import { check } from "../../icons/check.js";
import type { IconData } from "../../icons/types.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { usePopover } from "../../overlay/floating.js";
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
}

export interface MenuSection {
  /** Group name (shown and announced). */
  label: string;
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
  /** The commands: items, or labelled sections of items. */
  items: MenuEntry[];
  /** Called with the chosen item's `value`. */
  onSelect: (value: string) => void;
  /** Side of the trigger the menu opens on. Default "bottom". */
  placement?: Placement;
  /** Added to the menu panel, for layout. */
  className?: string;
  /** Layout only, applied to the panel. */
  style?: CSSProperties;
}

const ITEM = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
const isSection = (entry: MenuEntry): entry is MenuSection => "items" in entry;

export interface MenuPanelProps {
  id: string;
  label: string;
  items: MenuEntry[];
  onSelect: (value: string) => void;
  open: boolean;
  onClose: () => void;
  /** Which item takes focus when the panel opens. */
  focusOn: "first" | "last";
  /** What the panel is placed against: the trigger, or a point (context menus). */
  anchor: RefObject<HTMLElement | VirtualAnchor | null>;
  placement: Placement;
  offset: number;
  /** Elements that count as inside (clicking them does not dismiss). */
  inside: RefObject<HTMLElement | null>[];
  returnFocus: RefObject<HTMLElement | null>;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** Internal: the menu list in the top layer, shared by Menu and ContextMenu. */
export function MenuPanel({
  id,
  label,
  items,
  onSelect,
  open,
  onClose,
  focusOn,
  anchor,
  placement,
  offset,
  inside,
  returnFocus,
  className,
  style,
}: MenuPanelProps) {
  const apple = useApple();
  const panel = useRef<HTMLDivElement>(null);
  const typeTo = useTypeahead();

  usePopover(panel, open, (el) => {
    const enabled = [...el.querySelectorAll<HTMLElement>(ITEM)].filter(
      (i) => i.getAttribute("aria-disabled") !== "true",
    );
    (focusOn === "last" ? enabled[enabled.length - 1] : enabled[0])?.focus({ preventScroll: true });
  });
  useAnchoredPosition(anchor, panel, open, placement, offset, "start");
  useRovingFocus(panel, { orientation: "vertical", selector: ITEM });
  useDismiss({ open, onClose, inside: [...inside, panel], returnFocus });

  const choose = (item: MenuItem) => {
    if (item.disabled) return;
    onSelect(item.value);
    if (!(item.keepOpen ?? !!item.kind)) onClose();
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Tab leaves the menu like leaving the button: close and let focus move on.
    if (event.key === "Tab") {
      onClose();
      return;
    }
    if (!isTypeaheadKey(event)) return;
    const list = [...event.currentTarget.querySelectorAll<HTMLElement>(ITEM)].filter(
      (i) => i.getAttribute("aria-disabled") !== "true",
    );
    const from = list.indexOf(event.target as HTMLElement);
    list[
      typeTo(
        event.key,
        list.map((i) => i.dataset.label ?? ""),
        from,
      )
    ]?.focus();
  };

  const row = (item: MenuItem) => (
    <ButtonBase
      key={item.value}
      role={item.kind ? (item.kind === "checkbox" ? "menuitemcheckbox" : "menuitemradio") : "menuitem"}
      aria-checked={item.kind ? !!item.checked : undefined}
      aria-disabled={item.disabled || undefined}
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
      onClick={() => choose(item)}
    >
      {item.kind && (
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
    </ButtonBase>
  );

  return (
    <div
      ref={panel}
      id={`${id}-menu`}
      role="menu"
      aria-label={label}
      aria-orientation="vertical"
      {...{ popover: "manual" }}
      className={className ? `cy-menu ${className}` : "cy-menu"}
      style={style}
      onKeyDown={onPanelKeyDown}
    >
      {items.map((entry, i) =>
        isSection(entry) ? (
          <Fragment key={`section-${entry.label}`}>
            {i > 0 && <hr className="cy-menu-separator" />}
            {/* biome-ignore lint/a11y/useSemanticElements: APG menus group items with role="group"; a fieldset is for forms */}
            <div role="group" aria-label={entry.label} className="cy-menu-group">
              <span className="cy-menu-group-label" aria-hidden="true">
                {entry.label}
              </span>
              {entry.items.map(row)}
            </div>
          </Fragment>
        ) : (
          row(entry)
        ),
      )}
    </div>
  );
}

/** APG menu button: commands in a top-layer list with arrow keys, type-ahead, sections and checkable items. */
export function Menu({ trigger, label, items, onSelect, placement = "bottom", className, style }: MenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [focusOn, setFocusOn] = useState<"first" | "last">("first");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const show = useCallback((at: "first" | "last") => {
    setFocusOn(at);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {trigger({
        ref: triggerRef,
        onClick: () => (open ? setOpen(false) : show("first")),
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
