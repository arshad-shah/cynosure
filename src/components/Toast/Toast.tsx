import {
  type CSSProperties,
  createContext,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { checkCircle } from "../../icons/check-circle.js";
import { close as closeIcon } from "../../icons/close.js";
import { info } from "../../icons/info.js";
import type { IconData } from "../../icons/types.js";
import { warning } from "../../icons/warning.js";
import { xCircle } from "../../icons/x-circle.js";
import type { Tone } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface ToastTokens {
  width: string;
  radius: string;
  padding: string;
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    toast: ToastTokens;
  }
}

export type ToastTone = Extract<Tone, "neutral" | "success" | "danger" | "warning" | "info">;

export interface ToastOptions {
  title: string;
  description?: string;
  /** Colour and icon. `danger` is announced assertively (`role="alert"`); the others politely. */
  tone?: ToastTone;
  /** One button in the toast. It does not close the toast unless `onClick` dismisses it. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it closes itself (default 5000). `Infinity` keeps it until dismissed. */
  duration?: number;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  /** Closes one toast, or all of them without an id. */
  dismiss: (id?: string) => void;
}

export type ToastPosition =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

export interface ToastLabels {
  /** Name of the notifications region. */
  region: string;
  /** Accessible name of each toast's close button. */
  dismiss: string;
}

export interface ToasterProps {
  /** Where toasts stack. `start`/`end` follow the reading direction. */
  position?: ToastPosition;
  /** How many show at once; older ones collapse until newer ones close. */
  max?: number;
  labels?: Partial<ToastLabels>;
  className?: string;
  /** Layout only, applied to the region. Restyle through --cy-toast-* tokens. */
  style?: CSSProperties;
  /** The part of the app that can call `useToast()`. */
  children?: ReactNode;
}

interface Item extends ToastOptions {
  id: string;
  leaving?: boolean;
}

const DEFAULT_LABELS: ToastLabels = { region: "Notifications", dismiss: "Dismiss" };
const ICONS: Partial<Record<ToastTone, IconData>> = {
  success: checkCircle,
  danger: xCircle,
  warning,
  info,
};
/** Horizontal distance a touch has to travel to swipe a toast away. */
const SWIPE = 64;

const ToastContext = createContext<ToastApi | null>(null);

/** `toast()` and `dismiss()` for the nearest `<Toaster>`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast() needs a <Toaster> around it.");
  return api;
}

type RegionEl = HTMLElement & { showPopover?: () => void; hidePopover?: () => void };

/**
 * Hosts toasts for everything inside it: a region in the top layer, a store per Toaster (no globals), timers that pause
 * while the pointer or focus is on a toast, and polite or assertive announcements.
 */
export function Toaster({
  position = "bottom-end",
  max = 3,
  labels,
  className,
  style,
  children,
}: ToasterProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const prefix = useId();
  const count = useRef(0);
  const [items, setItems] = useState<Item[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const region = useRef<RegionEl>(null);

  const remove = useCallback((id: string) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const dismiss = useCallback(
    (id?: string) =>
      setItems((list) => list.map((t) => (id === undefined || t.id === id ? { ...t, leaving: true } : t))),
    [],
  );
  const toast = useCallback(
    (options: ToastOptions) => {
      count.current += 1;
      const id = `${prefix}-${count.current}`;
      setItems((list) => [...list, { ...options, id }]);
      return id;
    },
    [prefix],
  );
  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  // The region lives in the top layer for as long as the Toaster is mounted, so live regions exist before content.
  useLayoutEffect(() => {
    const el = region.current;
    el?.showPopover?.();
    return () => {
      if (el?.matches(":popover-open")) el.hidePopover?.();
    };
  }, []);
  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  // Focus left the region entirely (a toast closing with focus inside also counts).
  useEffect(() => {
    if (focused && !items.some((t) => !t.leaving)) setFocused(false);
  }, [focused, items]);

  const live = items.filter((t) => !t.leaving);
  const shown = new Set(live.slice(-max).map((t) => t.id));
  const paused = hovered || focused || hidden;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section
        ref={region}
        aria-label={text.region}
        {...{ popover: "manual" }}
        className={className ? `cy-toaster ${className}` : "cy-toaster"}
        data-position={position}
        style={style}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {items.map((item) => (
          <ToastItem
            key={item.id}
            item={item}
            collapsed={!item.leaving && !shown.has(item.id)}
            paused={paused}
            dismissLabel={text.dismiss}
            onDismiss={dismiss}
            onRemoved={remove}
          />
        ))}
      </section>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  item: Item;
  collapsed: boolean;
  paused: boolean;
  dismissLabel: string;
  onDismiss: (id: string) => void;
  onRemoved: (id: string) => void;
}

function ToastItem({ item, collapsed, paused, dismissLabel, onDismiss, onRemoved }: ToastItemProps) {
  const { id, title, description, tone = "neutral", action, duration = 5000, leaving = false } = item;
  const el = useRef<HTMLDivElement>(null);
  const remaining = useRef(duration);
  const drag = useRef<{ x: number; pointer: number } | null>(null);
  // The live element exists (empty) first and its text arrives a moment later: screen readers announce text added to
  // a live region, and the text is added once, so the toast is announced once.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss, keeping the time already spent across pauses.
  useEffect(() => {
    if (paused || collapsed || leaving || !Number.isFinite(duration) || duration <= 0) return;
    const started = Date.now();
    const t = setTimeout(() => onDismiss(id), Math.max(remaining.current, 0));
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - started;
    };
  }, [paused, collapsed, leaving, duration, id, onDismiss]);

  // Leaving: play the exit transition (none under reduced motion), then drop it from the store.
  useEffect(() => {
    if (!leaving) return;
    const node = el.current;
    const ms = node ? Number.parseFloat(getComputedStyle(node).transitionDuration) * 1000 || 0 : 0;
    const t = setTimeout(() => onRemoved(id), ms);
    return () => clearTimeout(t);
  }, [leaving, id, onRemoved]);

  const endSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start || start.pointer !== event.pointerId) return;
    drag.current = null;
    const node = event.currentTarget;
    delete node.dataset.swiping;
    if (Math.abs(event.clientX - start.x) >= SWIPE) onDismiss(id);
    else node.style.removeProperty("--_dx");
  };

  const icon = ICONS[tone];
  return (
    <div
      ref={el}
      role={tone === "danger" ? "alert" : "status"}
      aria-atomic="true"
      className="cy-toast"
      data-tone={tone}
      data-collapsed={collapsed || undefined}
      data-leaving={leaving || undefined}
      inert={collapsed || leaving || undefined}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch") return;
        drag.current = { x: event.clientX, pointer: event.pointerId };
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start || start.pointer !== event.pointerId) return;
        event.currentTarget.dataset.swiping = "";
        event.currentTarget.style.setProperty("--_dx", `${event.clientX - start.x}px`);
      }}
      onPointerUp={endSwipe}
      onPointerCancel={endSwipe}
    >
      {icon && <Icon icon={icon} className="cy-toast-icon" />}
      <div className="cy-toast-text cy-reset">
        {ready && (
          <>
            <span className="cy-toast-title cy-reset">{title}</span>
            {description && <span className="cy-toast-description cy-reset">{description}</span>}
          </>
        )}
      </div>
      {action && (
        <Button size="sm" variant="soft" tone={tone === "neutral" ? "accent" : tone} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      <IconButton
        icon={closeIcon}
        label={dismissLabel}
        variant="ghost"
        size="sm"
        onClick={() => onDismiss(id)}
      />
    </div>
  );
}
