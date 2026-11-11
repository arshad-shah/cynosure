import { sortable } from "@arshad-shah/detent";
import {
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { moveItems } from "../../foundations/reorder.js";
import { useRovingFocus } from "../../foundations/roving-focus.js";
import { close } from "../../icons/close.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface TabsTokens {
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
  /** Announced after a tab is moved. Default "Moved notes.md to position 2 of 4". */
  moved: (name: string, position: number, total: number) => string;
}

const DEFAULT_LABELS: TabsLabels = {
  close: (name) => `Close ${name}`,
  moved: (name, position, total) => `Moved ${name} to position ${position} of ${total}`,
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
  /** Replace the built-in English text: the close button's name and the announcement after a move. */
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
  useLayoutEffect(() => {
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

  const safe = (v: string) => v.replace(/[^\w-]/g, "_");
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
  /** Added to the tab list element, for layout. */
  className?: string;
  /** The `Tab`s, in order. */
  children?: ReactNode;
}

/** The tab inside a list child (a tab, or a closable tab's slot). */
const tabIn = (el: Element) =>
  (el.matches('[role="tab"]') ? el : el.querySelector('[role="tab"]')) as HTMLElement;

export function TabList({ label, onReorder, className, children }: TabListProps) {
  const { size, variant, value, labels, refocus } = useTabs("TabList");
  const ref = useRef<HTMLDivElement>(null);
  const [said, setSaid] = useState("");
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
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !reorderable) return;
    const bound = sortable(el, {
      direction: "x",
      keyboard: false,
      cancel: ".cy-tab-close",
      touchAction: "auto",
      get animation() {
        const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const base = Number.parseFloat(getComputedStyle(el).getPropertyValue("--cy-motion-slow"));
        return reduced ? 0 : Number.isFinite(base) ? base : 180;
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
  useRovingFocus(ref, { selector: '[role="tab"]' });
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
    const right = left + box.width;
    let target = current;
    if (left - pad < current) target = left - pad;
    else if (right + pad > current + list.clientWidth) target = right + pad - list.clientWidth;
    target = Math.min(Math.max(target, 0), max);
    if (target !== current) list.scrollTo({ left: rtl ? target - max : target });
  }, []);
  // Mark edges that hide tabs so CSS can fade them (works in RTL: scrollLeft is negative there).
  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const update = () => {
      const max = list.scrollWidth - list.clientWidth;
      const at = Math.abs(list.scrollLeft);
      list.toggleAttribute("data-more-start", max > 1 && at > 1);
      list.toggleAttribute("data-more-end", max > 1 && at < max - 1);
    };
    update();
    list.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  // Reveal again whenever the selection changes.
  useLayoutEffect(() => {
    reveal(ref.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') ?? null);
  }, [value, reveal]);
  const list = (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className={className ? `cy-tab-list ${className}` : "cy-tab-list"}
      data-size={size}
      data-variant={variant}
      data-reorderable={reorderable ? "" : undefined}
      onFocus={(e) => reveal(e.target as HTMLElement)}
      onKeyDownCapture={onKeyDown}
    >
      {children}
    </div>
  );
  // The announcement sits beside the list, not in it: a tablist holds only tabs, and every child is sortable.
  return reorderable ? (
    <>
      {list}
      <span className="cy-visually-hidden" role="status">
        {said}
      </span>
    </>
  ) : (
    list
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
   * Makes the tab closable (document tabs): a close button beside its label, and Delete on the focused tab. Remove the
   * tab in response; the one now in its place is selected and focused.
   */
  onClose?: (() => void) | undefined;
  /** The tab's label. */
  children: ReactNode;
}

export function Tab({ value, icon, disabled, onClose, children }: TabProps) {
  const { value: current, select, activation, tabId, panelId, panels, labels, refocus } = useTabs("Tab");
  const selected = value === current;
  const tab = (
    <ButtonBase
      role="tab"
      id={tabId(value)}
      aria-selected={selected}
      aria-controls={panels.has(value) ? panelId(value) : undefined}
      data-value={value}
      disabled={disabled}
      className="cy-tab"
      onClick={() => select(value)}
      onFocus={() => {
        if (activation === "auto" && !disabled) select(value);
      }}
      {...(onClose && {
        "aria-keyshortcuts": "Delete",
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if ((event.key !== "Delete" && event.key !== "Backspace") || disabled) return;
          event.preventDefault();
          refocus.current = "";
          onClose();
        },
      })}
    >
      {icon && <Icon icon={icon} className="cy-tab-icon" />}
      <span className="cy-tab-label">{children}</span>
    </ButtonBase>
  );
  if (!onClose) return tab;
  // The close button sits beside the tab, not in it (a tab is a button). Keyboard users press Delete instead, so it
  // stays out of the tab order and the accessibility tree; its label is its tooltip.
  return (
    <span className="cy-tab-slot" data-selected={selected ? "" : undefined}>
      {tab}
      <span className="cy-tab-close cy-reset" aria-hidden="true">
        <IconButton
          icon={close}
          label={labels.close(typeof children === "string" ? children : value)}
          variant="ghost"
          tone="neutral"
          size="sm"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => onClose()}
        />
      </span>
    </span>
  );
}

export interface TabPanelProps {
  /** The `value` of the `Tab` this panel belongs to. */
  value: string;
  /** Keep the content mounted while hidden (preserves state). By default only the selected panel renders content. */
  keepMounted?: boolean;
  /** Added to the panel element, for layout. */
  className?: string;
  /** The panel's content. */
  children?: ReactNode;
}

export function TabPanel({ value, keepMounted = false, className, children }: TabPanelProps) {
  const { value: current, tabId, panelId, registerPanel } = useTabs("TabPanel");
  useLayoutEffect(() => registerPanel(value), [registerPanel, value]);
  const selected = value === current;
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
      {selected || keepMounted ? children : null}
    </div>
  );
}
