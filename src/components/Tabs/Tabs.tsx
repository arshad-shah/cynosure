import { sortable } from "@arshad-shah/detent";
import {
  Children,
  type CSSProperties,
  createContext,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
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
import { LiveRegion, useLiveMessage } from "../../foundations/LiveRegion/LiveRegion.js";
import { clamp } from "../../foundations/math.js";
import { motionMs } from "../../foundations/motion.js";
import { usePrinting } from "../../foundations/printing.js";
import { moveItems } from "../../foundations/reorder.js";
import { useRovingFocus } from "../../foundations/roving-focus.js";
import { alignedScroll } from "../../foundations/scroll-align.js";
import { chevronDown } from "../../icons/chevron-down.js";
import { chevronLeft } from "../../icons/chevron-left.js";
import { chevronRight } from "../../icons/chevron-right.js";
import { close } from "../../icons/close.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { ContextMenu, type ContextMenuKeyTargetProps } from "../ContextMenu/ContextMenu.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu, type MenuEntry } from "../Menu/Menu.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

export interface TabsTokens {
  labelMaxWidth: string;
  dirty: string;
  gap: string;
  indicator: string;
  indicatorWidth: string;
  radius: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    tabs: TabsTokens;
  }
}

export interface TabsLabels {
  /** A closable tab's close button. Default "Close notes.md". */
  close: (name: string) => string;
  /** The close button of a tab with unsaved changes. Default "Close notes.md, unsaved changes". */
  closeUnsaved: (name: string) => string;
  /** The description of a tab with unsaved changes, read after its name. Default "Unsaved changes". */
  unsaved: string;
  /** The chevron that scrolls a `scrollable` list back toward its first tab. Default "Scroll tabs back". */
  scrollBack: string;
  /** The chevron that scrolls a `scrollable` list on toward its last tab. Default "Scroll tabs forward". */
  scrollForward: string;
  /** The name of a tab's context menu. Default "notes.md actions". */
  menu: (name: string) => string;
  /** Announced after a tab is moved. Default "Moved notes.md to position 2 of 4". */
  moved: (name: string, position: number, total: number) => string;
  /** The button (and its menu) holding the tabs that do not fit, with `overflow="menu"`. Default "More". */
  more: string;
}

const DEFAULT_LABELS: TabsLabels = {
  close: (name) => (name ? `Close ${name}` : "Close"),
  closeUnsaved: (name) => (name ? `Close ${name}, unsaved changes` : "Close, unsaved changes"),
  unsaved: "Unsaved changes",
  scrollBack: "Scroll tabs back",
  scrollForward: "Scroll tabs forward",
  menu: (name) => (name ? `${name} actions` : "Tab actions"),
  moved: (name, position, total) => `Moved ${name} to position ${position} of ${total}`,
  more: "More",
};

interface TabsContext {
  value: string | undefined;
  select: (value: string) => void;
  activation: "auto" | "manual";
  tabId: (value: string) => string;
  panelId: (value: string) => string;
  size: Size;
  variant: "line" | "soft";
  /** Values that have a TabPanel; tabs without one (e.g. routed content) omit aria-controls. */
  panels: ReadonlySet<string>;
  registerPanel: (value: string) => () => void;
  labels: TabsLabels;
  /** Set when a tab is closed or moved from the keyboard: focus the selected (or moved) tab once things settle. */
  refocus: { current: string | null };
}

const Context = createContext<TabsContext | null>(null);
const useTabs = (part: string) => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error(`<${part}> must be inside <Tabs>`);
  return ctx;
};

export interface TabsProps {
  /** Selected tab (controlled). */
  value?: string;
  /** Initially selected tab (uncontrolled). Defaults to the first enabled tab. */
  defaultValue?: string;
  /** Called with the tab's `value` when a different tab is selected. */
  onChange?: (value: string) => void;
  /** `auto`: arrow keys select as they move. `manual`: arrows move focus; Enter or Space selects. */
  activation?: "auto" | "manual";
  /** Height and text size of the tabs. Default "md". */
  size?: Size;
  /** `line`: underline indicator. `soft`: tinted pill. */
  variant?: "line" | "soft";
  /**
   * Replace the built-in English text: the close button's name (saved and unsaved), the unsaved description, the
   * scroll chevrons' names, the context menu's name and the announcement after a move.
   */
  labels?: Partial<TabsLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** A `TabList` and its `TabPanel`s. */
  children?: ReactNode;
}

/** APG tabs: a TabList of Tabs controlling TabPanels. */
export function Tabs({
  value,
  defaultValue,
  onChange,
  activation = "auto",
  size = "md",
  variant = "line",
  labels,
  className,
  style,
  children,
}: TabsProps) {
  const refocus = useRef<string | null>(null);
  const base = useId();
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const root = useRef<HTMLDivElement>(null);
  const lastIndex = useRef(0);
  const [panels, setPanels] = useState<ReadonlySet<string>>(() => new Set());
  const registerPanel = useCallback((v: string) => {
    setPanels((all) => new Set(all).add(v));
    return () =>
      setPanels((all) => {
        const next = new Set(all);
        next.delete(v);
        return next;
      });
  }, []);
  const select = useCallback(
    (next: string) => {
      if (next !== current) setCurrent(next);
    },
    [current, setCurrent],
  );

  // Keep a valid selection: default to the first enabled tab, and when the selected tab disappears pick the one now
  // at its position (or the previous one).
  useClientLayoutEffect(() => {
    const tabs = [...(root.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])].filter(
      (t) => t.closest(".cy-tabs") === root.current,
    );
    const values = tabs.map((t) => t.dataset.value as string);
    const index = current === undefined ? -1 : values.indexOf(current);
    if (index >= 0) {
      lastIndex.current = index;
      // After a close or a keyboard move, focus lands on the moved tab, or the selected one.
      if (refocus.current !== null) {
        const want = values.includes(refocus.current) ? refocus.current : current;
        refocus.current = null;
        tabs[values.indexOf(want as string)]?.focus();
      }
      return;
    }
    const usable = tabs.filter((t) => !(t as HTMLButtonElement).disabled);
    if (!usable.length) return;
    const at = tabs[Math.min(lastIndex.current, tabs.length - 1)];
    const pick =
      current === undefined
        ? usable[0]
        : at && !(at as HTMLButtonElement).disabled
          ? at
          : (usable.find((t) => tabs.indexOf(t) >= lastIndex.current) ?? usable[usable.length - 1]);
    const next = pick?.dataset.value;
    if (next !== undefined) setCurrent(next);
  });

  // An id from any value, one to one: letters, digits and "-" stay; every other character (including "_") becomes
  // "_<code>_", so "a b" and "a_b" never share an id.
  const safe = (v: string) =>
    v.replace(/[^A-Za-z0-9-]/gu, (c) => `_${(c.codePointAt(0) as number).toString(36)}_`);
  return (
    <Context.Provider
      value={{
        value: current,
        select,
        activation,
        tabId: (v) => `${base}-tab-${safe(v)}`,
        panelId: (v) => `${base}-panel-${safe(v)}`,
        size,
        variant,
        panels,
        registerPanel,
        labels: { ...DEFAULT_LABELS, ...labels },
        refocus,
      }}
    >
      <div ref={root} className={className ? `cy-tabs ${className}` : "cy-tabs"} style={style}>
        {children}
      </div>
    </Context.Provider>
  );
}

export interface TabListProps {
  /** Accessible name for the tab list. */
  label: string;
  /**
   * Makes the tabs reorderable (document tabs): drag one along the list, or press Ctrl+Shift (Cmd+Shift) with an
   * arrow on it. Called with every tab's value in the new order; render the tabs in that order.
   */
  onReorder?: ((values: string[]) => void) | undefined;
  /**
   * For many tabs (document tabs): chevrons at each end scroll the list while there is more that way, and a vertical
   * mouse wheel scrolls it sideways. The chevrons are for the pointer; arrow keys scroll the focused tab into view.
   */
  scrollable?: boolean | undefined;
  /**
   * `"menu"`: the tabs that do not fit the list's width go into a More menu at its end, in order, with their icons
   * and shortcuts (mode tabs in a narrow window). The selected tab always keeps its place in the row; choosing one
   * from the menu selects it. Arrow keys move through the tabs in the row. Not with `scrollable`.
   */
  overflow?: "menu" | undefined;
  /**
   * Content after the last tab, outside the tab list, such as a "New tab" IconButton. It follows the last tab, and
   * stays at the end in view when the tabs overflow.
   */
  trailing?: ReactNode;
  /** Added to the tab list element, for layout. */
  className?: string;
  /** The `Tab`s, in order. */
  children?: ReactNode;
}

/** The context menu a tab asks its list to open: its commands and where they go. */
interface TabMenu {
  value: string;
  name: string;
  items: MenuEntry[];
  onSelect: ((command: string) => void) | undefined;
}

/** The values of the tabs a `overflow="menu"` list has moved into its More menu; such a tab is not drawn in the row. */
const OverflowContext = createContext<ReadonlySet<string>>(new Set());

/** The list's one ContextMenu, shared with its tabs: the props that make a tab one of its targets. */
const MenuContext = createContext<((menu: TabMenu) => ContextMenuKeyTargetProps) | null>(null);

/** The label inside a tab: the text a tooltip shows in full while it is cut short. */
const labelOf = (tab: HTMLElement) => tab.querySelector<HTMLElement>(".cy-tab-label");

/** The tab inside a list child (a tab, or a closable tab's slot). */
const tabIn = (el: Element) =>
  (el.matches('[role="tab"]') ? el : el.querySelector('[role="tab"]')) as HTMLElement;

export function TabList({
  label,
  onReorder,
  scrollable = false,
  overflow,
  trailing,
  className,
  children,
}: TabListProps) {
  const { size, variant, value, labels, refocus, select } = useTabs("TabList");
  const ref = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [said, setSaid] = useLiveMessage();
  const latest = useRef({ onReorder, labels });
  latest.current = { onReorder, labels };
  const order = () => [...(ref.current?.children ?? [])].map((c) => tabIn(c)?.dataset.value as string);
  const name = (v: string) => {
    const tab = [...(ref.current?.children ?? [])].map(tabIn).find((t) => t?.dataset.value === v);
    return tab?.querySelector(".cy-tab-label")?.textContent || v;
  };
  const move = (v: string, to: number) => {
    const values = order();
    const next = moveItems(values, [v], to, (x) => x);
    latest.current.onReorder?.(next);
    setSaid(latest.current.labels.moved(name(v), to + 1, next.length));
  };
  // Pointer, touch and pen reordering through detent's sortable (as SortableList). A finger held briefly drags; a
  // swipe still scrolls the list. React stays the DOM's owner: the node is put back and the new order is reported.
  const reorderable = onReorder !== undefined;
  useClientLayoutEffect(() => {
    const el = ref.current;
    if (!el || !reorderable) return;
    const bound = sortable(el, {
      direction: "x",
      keyboard: false,
      cancel: ".cy-tab-close",
      touchAction: "auto",
      get animation() {
        return motionMs(el);
      },
      onSort: ({ item, from, to }) => {
        const v = tabIn(item).dataset.value as string;
        item.remove();
        el.insertBefore(item, el.children[from.index] ?? null);
        move(v, to.index);
      },
    });
    return () => bound.destroy();
  }, [reorderable]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tab = event.target as HTMLElement;
    if (!reorderable || tab.getAttribute("role") !== "tab") return;
    if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
    const dir = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!dir) return;
    event.preventDefault();
    event.stopPropagation();
    const v = tab.dataset.value as string;
    const values = order();
    const to = values.indexOf(v) + (isRtl(tab) ? -dir : dir);
    if (to < 0 || to >= values.length) return;
    refocus.current = v;
    move(v, to);
  };
  useRovingFocus(ref, { selector: '[role="tab"]:not([data-overflowed])' });
  // Keep the selected (or focused) tab fully visible and clear of the faded edges. The target is a position in the
  // content (not relative to the current scroll), so repeated key presses during a smooth scroll still land right.
  const reveal = useCallback((tab: HTMLElement | null) => {
    const list = ref.current;
    if (!list || !tab || !list.contains(tab)) return;
    const max = list.scrollWidth - list.clientWidth;
    if (max <= 0) return;
    const pad = Number.parseFloat(getComputedStyle(list).getPropertyValue("--cy-space-9")) || 0;
    const rtl = isRtl(list);
    // Physical position from the left edge of the scrollable content (RTL scrollLeft runs from 0 down to -max).
    const current = rtl ? list.scrollLeft + max : list.scrollLeft;
    // Where the tab starts in the scrollable content, measured from the list itself (offsetLeft depends on the offset
    // parent and on how the engine handles right-to-left scrolling; rects read in the same frame do not).
    const box = tab.getBoundingClientRect();
    const left = box.left - list.getBoundingClientRect().left - list.clientLeft + current;
    const target = clamp(alignedScroll(current, list.clientWidth, left - pad, box.width + 2 * pad), 0, max);
    if (target !== current) list.scrollTo({ left: rtl ? target - max : target });
  }, []);
  // Mark edges that hide tabs so CSS can fade them, and show the chevrons that lead there (works in RTL: scrollLeft is
  // negative there).
  const edges = useCallback(() => {
    const list = ref.current;
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    const at = Math.abs(list.scrollLeft);
    for (const el of [list, strip.current]) {
      el?.toggleAttribute("data-more-start", max > 1 && at > 1);
      el?.toggleAttribute("data-more-end", max > 1 && at < max - 1);
    }
    strip.current?.toggleAttribute("data-overflow", max > 1);
  }, []);
  useClientLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    list.addEventListener("scroll", edges, { passive: true });
    const observer = new ResizeObserver(edges);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", edges);
      observer.disconnect();
    };
  }, [edges]);
  // Tabs added or removed change what there is to scroll to without resizing a list that already overflows.
  useClientLayoutEffect(edges);
  // A vertical wheel scrolls a scrollable list sideways; at the end it has nowhere to go, the page scrolls instead.
  useClientLayoutEffect(() => {
    const list = ref.current;
    if (!list || !scrollable) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = list.scrollWidth - list.clientWidth;
      const at = Math.abs(list.scrollLeft);
      if (max <= 1 || (event.deltaY > 0 ? at >= max - 1 : at <= 1)) return;
      event.preventDefault();
      const line = Number.parseFloat(getComputedStyle(list).lineHeight) || 16;
      const unit = event.deltaMode === 1 ? line : event.deltaMode === 2 ? list.clientWidth : 1;
      list.scrollBy({ left: event.deltaY * unit * (isRtl(list) ? -1 : 1), behavior: "instant" });
    };
    list.addEventListener("wheel", onWheel, { passive: false });
    return () => list.removeEventListener("wheel", onWheel);
  }, [scrollable]);
  // A chevron scrolls most of a list's width, so the tab cut at that edge is still in view afterwards.
  const page = (direction: 1 | -1) => {
    const list = ref.current;
    if (!list) return;
    list.scrollBy({ left: direction * list.clientWidth * 0.8 * (isRtl(list) ? -1 : 1) });
  };
  // Reveal again whenever the selection changes.
  useClientLayoutEffect(() => {
    reveal(ref.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') ?? null);
  }, [value, reveal]);
  // overflow="menu": which tabs fit the row. Widths are measured while a tab is drawn and remembered while it is in the
  // menu; the More button is always rendered (out of sight while idle) so its width is known before it is needed.
  const fitting = overflow === "menu";
  const more = useRef<HTMLDivElement>(null);
  const widths = useRef(new Map<string, number>());
  const [overflowed, setOverflowed] = useState<ReadonlySet<string>>(() => new Set());
  const fit = useCallback(() => {
    const list = ref.current;
    const row = strip.current;
    if (!fitting || !list || !row) return;
    const kids = [...list.children] as HTMLElement[];
    const values = kids.map((k) => tabIn(k)?.dataset.value ?? "");
    kids.forEach((k, i) => {
      const w = k.getBoundingClientRect().width;
      if (w > 0) widths.current.set(values[i] as string, w);
    });
    const width = (v: string) => widths.current.get(v) ?? 0;
    const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
    const rowGap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
    const besides = [...row.children]
      .filter((c) => c !== list && c !== more.current)
      .reduce((sum, c) => sum + c.getBoundingClientRect().width + rowGap, 0);
    const room = row.clientWidth - besides;
    const all = values.reduce((sum, v, i) => sum + width(v) + (i ? gap : 0), 0);
    let next: string[] = [];
    if (all > room + 0.5) {
      const space = room - (more.current?.getBoundingClientRect().width ?? 0) - rowGap;
      const shown: string[] = [];
      let used = 0;
      for (const v of values) {
        const add = width(v) + (shown.length ? gap : 0);
        if (used + add > space) break;
        shown.push(v);
        used += add;
      }
      // The selected tab keeps a place: it takes the last one(s) that fit.
      if (value !== undefined && values.includes(value) && !shown.includes(value)) {
        while (shown.length && used + gap + width(value) > space) {
          const v = shown.pop() as string;
          used -= width(v) + (shown.length ? gap : 0);
        }
        shown.push(value);
      }
      if (!shown.length && values[0] !== undefined) shown.push(values[0]);
      next = values.filter((v) => !shown.includes(v));
    }
    setOverflowed((prev) =>
      prev.size === next.length && next.every((v) => prev.has(v)) ? prev : new Set(next),
    );
  }, [fitting, value]);
  useClientLayoutEffect(() => {
    const row = strip.current;
    if (!fitting || !row) return;
    const observer = new ResizeObserver(() => fit());
    observer.observe(row);
    return () => observer.disconnect();
  }, [fitting, fit]);
  // Tabs added, removed or relabelled, and a new selection, can change what fits.
  useClientLayoutEffect(() => fit());
  const moreItems: MenuEntry[] = fitting
    ? Children.toArray(children)
        .filter((c) => isValidElement<TabProps>(c) && overflowed.has(c.props.value))
        .map((c) => {
          const tab = (c as { props: TabProps }).props;
          return {
            value: tab.value,
            label: name(tab.value),
            ...(tab.icon ? { icon: tab.icon } : {}),
            ...(tab.shortcut ? { shortcut: tab.shortcut } : {}),
            ...(tab.disabled ? { disabled: true } : {}),
          };
        })
    : [];
  const moreMenu = fitting && (
    <div ref={more} className="cy-tab-more" data-idle={moreItems.length ? undefined : ""}>
      <Menu
        label={labels.more}
        items={moreItems}
        onSelect={(v) => select(v)}
        trigger={(props) => (
          <Button {...props} variant="ghost" tone="neutral" size="sm" iconEnd={chevronDown}>
            {labels.more}
          </Button>
        )}
      />
    </div>
  );
  const tablist = (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className={className ? `cy-tab-list ${className}` : "cy-tab-list"}
      data-size={size}
      data-variant={variant}
      data-reorderable={reorderable ? "" : undefined}
      data-overflow-menu={fitting ? "" : undefined}
      onFocus={(e) => reveal(e.target as HTMLElement)}
      onKeyDownCapture={onKeyDown}
    >
      {children}
    </div>
  );
  const chevron = (edge: "start" | "end") => (
    // For the pointer only, like a tab's close button: keyboard users move with the arrows, which reveal the tab.
    <span className="cy-tab-scroll cy-reset" data-edge={edge} aria-hidden="true">
      <IconButton
        icon={edge === "start" ? chevronLeft : chevronRight}
        flipRtl
        label={edge === "start" ? labels.scrollBack : labels.scrollForward}
        variant="ghost"
        tone="neutral"
        size="sm"
        tabIndex={-1}
        onClick={() => page(edge === "start" ? -1 : 1)}
      />
    </span>
  );
  // The chevrons and the trailing content sit beside the list, not in it: a tablist holds only tabs.
  const scrolls = scrollable && !fitting;
  const list =
    scrolls || fitting || trailing !== undefined ? (
      <div
        ref={strip}
        className="cy-tab-strip"
        data-size={size}
        data-variant={variant}
        data-overflow-menu={fitting ? "" : undefined}
      >
        {scrolls && chevron("start")}
        <OverflowContext.Provider value={overflowed}>{tablist}</OverflowContext.Provider>
        {scrolls && chevron("end")}
        {moreMenu}
        {trailing !== undefined && <div className="cy-tab-trailing">{trailing}</div>}
      </div>
    ) : (
      tablist
    );
  // One context menu for the list, opened for whichever tab asked. Its panel lands beside the list, not in it: a
  // tablist holds only tabs, even while a menu is open.
  const hosted = (
    <ContextMenu<TabMenu>
      label={(menu) => labels.menu(menu.name)}
      items={(menu) => menu.items}
      onSelect={(command, menu) => {
        // A command that removes the tab (Close, Close others…) moves focus to the tab then selected, as Delete does;
        // one that keeps it leaves focus on it.
        refocus.current = menu.value;
        menu.onSelect?.(command);
      }}
      onOpenChange={(open, menu) => {
        // The tab is still there (a command such as "Copy path"): the menu returns focus to it, so drop the request,
        // which would otherwise pull focus back to it on some later render. A removed tab leaves it for Tabs.
        if (!open && refocus.current === menu.value && order().includes(menu.value)) refocus.current = null;
      }}
    >
      {(_, targetFor) => <MenuContext.Provider value={targetFor}>{list}</MenuContext.Provider>}
    </ContextMenu>
  );
  // The announcement sits beside the list, not in it: a tablist holds only tabs, and every child is sortable.
  return reorderable ? (
    <>
      {hosted}
      <LiveRegion {...said} />
    </>
  ) : (
    hosted
  );
}

export interface TabProps {
  /** Identifies the tab: it is what `Tabs` selects by, and what its `TabPanel` matches. */
  value: string;
  /** Icon shown before the label. */
  icon?: IconData;
  /** The tab cannot be selected or closed. */
  disabled?: boolean;
  /**
   * The tab's key combination, written as `useHotkey` writes it ("alt+3", "mod+shift+e"): `aria-keyshortcuts` on the
   * tab, and the hint beside it in an `overflow="menu"` list's More menu. Handle the keys yourself (`useHotkey`).
   */
  shortcut?: string | undefined;
  /**
   * Makes the tab closable (document tabs): a close button beside its label, Delete on the focused tab and a
   * middle-click. Remove the tab in response; the one now in its place is selected and focused.
   */
  onClose?: (() => void) | undefined;
  /**
   * The document has unsaved changes: a dot where the close button sits, which turns into the close button while the
   * tab is hovered or focused. Announced as the tab's description (`labels.unsaved`), and the close button says so.
   */
  dirty?: boolean | undefined;
  /**
   * The close button's name (and tooltip), such as "Close query 3". By default it is `labels.close` with the tab's
   * text: the label itself when it is a string, else the text it renders.
   */
  closeLabel?: string | undefined;
  /**
   * Commands for this tab, in a ContextMenu opened by right-click, a long press, Shift+F10 or the context menu key:
   * items, or sections of items, as in `Menu` (Close others, Close to the right…). Named `labels.menu` with its text.
   */
  contextMenu?: MenuEntry[] | undefined;
  /**
   * Called with the chosen `contextMenu` item's `value` (named as Tree's `onCommand`). If the command removes this tab,
   * focus moves to the tab then selected, as after Delete.
   */
  onCommand?: ((value: string) => void) | undefined;
  /** The tab's label. */
  children: ReactNode;
}

export function Tab({
  value,
  icon,
  disabled,
  shortcut,
  onClose,
  closeLabel,
  dirty = false,
  contextMenu,
  onCommand,
  children,
}: TabProps) {
  const { value: current, select, activation, tabId, panelId, panels, labels, refocus } = useTabs("Tab");
  const selected = value === current;
  const overflowed = useContext(OverflowContext).has(value);
  // A label that is not plain text (a badge, a <strong>) names the close button and the menu by the text it renders.
  const plain = typeof children === "string" || typeof children === "number" ? String(children) : null;
  const labelRef = useRef<HTMLSpanElement>(null);
  const [rendered, setRendered] = useState("");
  useClientLayoutEffect(() => {
    if ((!onClose && !contextMenu) || plain !== null) return;
    const text = labelRef.current?.textContent?.trim() ?? "";
    if (text !== rendered) setRendered(text);
  });
  const id = tabId(value);
  const name = plain ?? rendered;
  const closeKey = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClose || (event.key !== "Delete" && event.key !== "Backspace") || disabled) return;
    event.preventDefault();
    refocus.current = "";
    onClose();
  };
  // With commands, the tab is one of its list's context menu targets.
  const targetFor = useContext(MenuContext);
  const menu =
    contextMenu && targetFor
      ? targetFor({ value, name, items: contextMenu, onSelect: onCommand })
      : undefined;
  const button = (
    <ButtonBase
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={panels.has(value) ? panelId(value) : undefined}
      // The unsaved state is a description, not part of the name: the name stays the document's (what voice control,
      // the close button and the panel's label use), and screen readers read the state after it.
      aria-describedby={dirty ? `${id}-unsaved` : undefined}
      aria-keyshortcuts={
        [
          shortcut && ariaKeyShortcuts(shortcutKeys(shortcut)),
          onClose && "Delete",
          menu?.["aria-keyshortcuts"],
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
      data-value={value}
      data-overflowed={overflowed ? "" : undefined}
      disabled={disabled}
      className="cy-tab"
      onClick={() => select(value)}
      onFocus={() => {
        if (activation === "auto" && !disabled) select(value);
      }}
      onKeyDown={(event) => {
        closeKey(event);
        menu?.onKeyDown(event);
      }}
      {...(onClose && {
        // A middle-click closes, as in browsers and editors; its press must not start the browser's autoscroll.
        onMouseDown: (event: MouseEvent<HTMLElement>) => {
          if (event.button === 1) event.preventDefault();
        },
        onAuxClick: (event: MouseEvent<HTMLElement>) => {
          if (event.button !== 1 || disabled) return;
          event.preventDefault();
          onClose();
        },
      })}
      {...(menu && {
        onContextMenu: menu.onContextMenu,
        onPointerDown: menu.onPointerDown,
        onPointerMove: menu.onPointerMove,
        onPointerUp: menu.onPointerUp,
        onPointerCancel: menu.onPointerCancel,
      })}
    >
      {icon && <Icon icon={icon} className="cy-tab-icon" />}
      <span ref={labelRef} className="cy-tab-label">
        {children}
      </span>
    </ButtonBase>
  );
  // A label cut short by `--cy-tabs-label-max-width` shows its full text in a tooltip, for the eye only (the name
  // already holds it). The tooltip is always there (off while the label fits), so the tab is never remounted.
  const tab = (
    <Tooltip content={children} whenTruncated={labelOf} placement="bottom" className="cy-tab-tip">
      {button}
    </Tooltip>
  );
  // The close button sits beside the tab, not in it (a tab is a button). Keyboard users press Delete instead, so it
  // stays out of the tab order and the accessibility tree; its label is its tooltip. An unsaved tab's dot sits in the
  // same place, under it, and the stylesheet shows one or the other.
  if (!onClose && !dirty) return tab;
  return (
    <span
      className="cy-tab-slot"
      data-selected={selected ? "" : undefined}
      data-dirty={dirty ? "" : undefined}
    >
      {tab}
      {dirty && (
        <>
          <span className="cy-tab-dirty cy-reset" aria-hidden="true" />
          {/* Hidden, so outside the accessibility tree (a tablist holds only tabs) but still read as the description. */}
          <span id={`${id}-unsaved`} hidden>
            {labels.unsaved}
          </span>
        </>
      )}
      {onClose && (
        <span className="cy-tab-close cy-reset" aria-hidden="true">
          <IconButton
            icon={close}
            label={closeLabel ?? (dirty ? labels.closeUnsaved(name) : labels.close(name))}
            variant="ghost"
            tone="neutral"
            size="sm"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => onClose()}
          />
        </span>
      )}
    </span>
  );
}

export interface TabPanelProps {
  /** The `value` of the `Tab` this panel belongs to. */
  value: string;
  /**
   * Keep the content mounted while hidden (preserves state). By default only the selected panel renders content.
   * Every panel is rendered and shown while the page is printed, so a printout has all of them.
   */
  keepMounted?: boolean;
  /** Added to the panel element, for layout. */
  className?: string;
  /** The panel's content. */
  children?: ReactNode;
}

export function TabPanel({ value, keepMounted = false, className, children }: TabPanelProps) {
  const { value: current, tabId, panelId, registerPanel } = useTabs("TabPanel");
  useClientLayoutEffect(() => registerPanel(value), [registerPanel, value]);
  const selected = value === current;
  const printing = usePrinting();
  return (
    <div
      role="tabpanel"
      id={panelId(value)}
      aria-labelledby={tabId(value)}
      hidden={!selected}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: APG tabs: a panel is focusable so keyboard users reach panels that have no controls
      tabIndex={0}
      className={className ? `cy-tab-panel ${className}` : "cy-tab-panel"}
    >
      {selected || keepMounted || printing ? children : null}
    </div>
  );
}
