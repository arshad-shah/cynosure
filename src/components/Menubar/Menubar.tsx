import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { isRtl } from "../../foundations/dir.js";
import { useRovingFocus } from "../../foundations/roving-focus.js";
import type { Size } from "../../tokens/schema.js";
import { type MenuEntry, MenuPanel } from "../Menu/Menu.js";

export interface MenubarTokens {
  activeBg: string;
  radius: string;
  paddingInline: string;
  height: string;
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    menubar: MenubarTokens;
  }
}

export interface MenubarMenu {
  /** The menu's title in the bar, and the accessible name of its list. */
  label: string;
  /** Its commands, exactly as Menu takes them: items (icons, shortcuts, checkable kinds) or labelled sections. */
  items: MenuEntry[];
}

export interface MenubarProps {
  /** Accessible name of the bar (required: a menubar must be named). */
  label: string;
  /** The top-level menus, in reading order. */
  menus: MenubarMenu[];
  /** Called with the chosen item's `value`, from whichever menu. */
  onSelect: (value: string) => void;
  /** Size of the menu titles (shared vocabulary: docs/conventions.md). Default "md". */
  size?: Size;
  /** Added to the bar, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-menubar-* tokens. */
  style?: CSSProperties;
}

const TITLE = "[data-menubar-title]";

/**
 * APG menubar: a row of menu titles (File, Edit, View) each opening a Menu. One Tab stop; Left/Right move between
 * titles, or between menus while one is open; hovering a title while a menu is open switches to it.
 */
export function Menubar({ label, menus, onSelect, size = "md", className, style }: MenubarProps) {
  const id = useId();
  const bar = useRef<HTMLDivElement>(null);
  const titles = useRef<RefObject<HTMLButtonElement | null>[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [focusOn, setFocusOn] = useState<"first" | "last">("first");
  useRovingFocus(bar, { orientation: "horizontal", selector: TITLE });

  for (let i = titles.current.length; i < menus.length; i++) titles.current.push({ current: null });

  const show = useCallback((index: number, at: "first" | "last" = "first") => {
    setFocusOn(at);
    setOpen(index);
  }, []);
  const close = useCallback(() => setOpen(null), []);

  const onTitleKeyDown = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      show(index, event.key === "ArrowUp" ? "last" : "first");
    }
    // Enter and Space open on the first item through the click they cause.
  };

  // Keys inside an open menu bubble here: Left/Right move to the neighbouring menu, Tab leaves the bar.
  const onBarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (open === null || !(event.target as HTMLElement).closest('[role="menu"]')) return;
    if (event.key === "Tab") {
      // The menu closes itself. Tab and Shift+Tab leave the whole bar: focus its title (the bar's tab stop from now
      // on) and take every title out of the tab order until the browser has moved focus on.
      const title = titles.current[open]?.current;
      title?.focus();
      const all = titles.current.map((t) => t.current).filter((t): t is HTMLButtonElement => !!t);
      for (const t of all) t.tabIndex = -1;
      setTimeout(() => {
        if (title?.isConnected) title.tabIndex = 0;
      });
      return;
    }
    if ((event.key !== "ArrowLeft" && event.key !== "ArrowRight") || event.defaultPrevented) return;
    event.preventDefault();
    const forward = (event.key === "ArrowRight") !== isRtl(event.currentTarget);
    const next = (open + (forward ? 1 : -1) + menus.length) % menus.length;
    show(next);
    titles.current[next]?.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={bar}
      role="menubar"
      aria-label={label}
      aria-orientation="horizontal"
      className={className ? `cy-menubar ${className}` : "cy-menubar"}
      data-size={size}
      style={style}
      onKeyDown={onBarKeyDown}
    >
      {menus.map((menu, i) => {
        const title = titles.current[i] as RefObject<HTMLButtonElement | null>;
        const menuId = `${id}-${i}`;
        return (
          <Fragment key={`${i}-${menu.label}`}>
            <ButtonBase
              ref={title}
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={open === i}
              aria-controls={`${menuId}-menu`}
              data-menubar-title=""
              className="cy-menubar-item"
              onClick={() => (open === i ? close() : show(i))}
              onKeyDown={onTitleKeyDown(i)}
              onPointerEnter={(event) => {
                // Hovering switches menus only while one is open; at rest it opens nothing.
                if (event.pointerType !== "touch" && open !== null && open !== i) show(i);
              }}
            >
              {menu.label}
            </ButtonBase>
            <MenuPanel
              id={menuId}
              label={menu.label}
              items={menu.items}
              onSelect={onSelect}
              open={open === i}
              onClose={close}
              focusOn={focusOn}
              anchor={title}
              placement="bottom"
              inside={[title]}
              returnFocus={title}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
