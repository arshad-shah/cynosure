import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { useRovingFocus } from "../../foundations/roving-focus.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";

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
  onChange?: (value: string) => void;
  /** `auto`: arrow keys select as they move. `manual`: arrows move focus; Enter or Space selects. */
  activation?: "auto" | "manual";
  size?: Size;
  /** `line`: underline indicator. `soft`: tinted pill. */
  variant?: "line" | "soft";
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
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
  className,
  style,
  children,
}: TabsProps) {
  const base = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
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
      if (next === current) return;
      if (value === undefined) setInner(next);
      onChange?.(next);
    },
    [current, value, onChange],
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
    if (next === undefined) return;
    if (value === undefined) setInner(next);
    onChange?.(next);
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
  className?: string;
  children?: ReactNode;
}

export function TabList({ label, className, children }: TabListProps) {
  const { size, variant, value } = useTabs("TabList");
  const ref = useRef<HTMLDivElement>(null);
  useRovingFocus(ref, { selector: '[role="tab"]' });
  // Keep the selected (or focused) tab fully visible and clear of the faded edges. The target is a position in the
  // content (not relative to the current scroll), so repeated key presses during a smooth scroll still land right.
  const reveal = useCallback((tab: HTMLElement | null) => {
    const list = ref.current;
    if (!list || !tab || !list.contains(tab)) return;
    const max = list.scrollWidth - list.clientWidth;
    if (max <= 0) return;
    const pad = Number.parseFloat(getComputedStyle(list).getPropertyValue("--cy-space-9")) || 0;
    const rtl = getComputedStyle(list).direction === "rtl";
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
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className={className ? `cy-tab-list ${className}` : "cy-tab-list"}
      data-size={size}
      data-variant={variant}
      onFocus={(e) => reveal(e.target as HTMLElement)}
    >
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  icon?: IconData;
  disabled?: boolean;
  children: ReactNode;
}

export function Tab({ value, icon, disabled, children }: TabProps) {
  const { value: current, select, activation, tabId, panelId, panels } = useTabs("Tab");
  const selected = value === current;
  return (
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
    >
      {icon && <Icon icon={icon} className="cy-tab-icon" />}
      <span className="cy-tab-label">{children}</span>
    </ButtonBase>
  );
}

export interface TabPanelProps {
  value: string;
  /** Keep the content mounted while hidden (preserves state). By default only the selected panel renders content. */
  keepMounted?: boolean;
  className?: string;
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
