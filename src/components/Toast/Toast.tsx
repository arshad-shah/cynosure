import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useDrag } from "../../foundations/drag.js";
import { deepActiveElement } from "../../foundations/focus.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { transitionTime } from "../../foundations/motion.js";
import { TONE_ICONS } from "../../foundations/tone-icons.js";
import { close as closeIcon } from "../../icons/close.js";
import { ToastHostContext, type ToastHostRegistry } from "../../overlay/toast-host.js";
import type { Tone } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { LoadingDots } from "../LoadingDots/LoadingDots.js";
import { type Space, space } from "../Stack/space.js";

export interface ToastTokens {
  width: string;
  radius: string;
  padding: string;
  gap: string;
  /** Extra distance between the toasts and the top or bottom edge they sit on (a fixed tab bar or header). */
  offsetBlock: string;
  /** Extra distance between the toasts and the side they sit on (a fixed side rail). */
  offsetInline: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    toast: ToastTokens;
  }
}

export type ToastTone = Extract<Tone, "neutral" | "success" | "danger" | "warning" | "info">;

/** Why a toast closed: its timer ran out, the user closed it (close button or swipe), or `dismiss()` was called. */
export type ToastDismissReason = "timeout" | "user" | "programmatic";

export interface ToastOptions {
  /**
   * Names the toast. Calling `toast()` again with the id of a toast that is still showing updates that toast in place
   * (a loading toast becoming done) instead of adding another; its timer starts again with the new `duration`.
   * Default: a new id for every call.
   */
  id?: string;
  title: string;
  description?: string;
  /** Colour and icon. `danger` is announced assertively (`role="alert"`); the others politely. */
  tone?: ToastTone;
  /** One button in the toast. It does not close the toast unless `onClick` dismisses it. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it closes itself (default 5000). `Infinity` keeps it until dismissed. */
  duration?: number;
  /**
   * Work in progress: a spinner in place of the tone's icon, and no timer until the toast is updated (`toast()` with
   * the same `id`) or dismissed.
   */
  loading?: boolean;
  /** Called once when the toast starts to close, with its id and why it closed. */
  onDismiss?: (id: string, reason: ToastDismissReason) => void;
}

export interface ToastApi {
  /** Shows a toast and returns its id; with the `id` of a toast that is showing, updates that toast instead. */
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

/** A distance: a step of the space scale (`"6"` is `--cy-space-6`) or any CSS length (`"72px"`, `"calc(56px + 1rem)"`). */
export type ToastOffsetLength = Space | (string & {});

/** How far in from their edges the toasts sit, for each axis. */
export interface ToastOffset {
  /** From the top or bottom edge, whichever `position` names. */
  block?: ToastOffsetLength | undefined;
  /** From the side `position` names (both sides for `center`). Follows the reading direction. */
  inline?: ToastOffsetLength | undefined;
}

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
  /**
   * Keeps the toasts clear of fixed parts of the app, such as a bottom tab bar: extra distance from the edge they sit
   * on, added to the usual margin and the device's safe area. A step of the space scale (`"8"`) or a CSS length
   * (`"72px"`) moves them in from the top or bottom edge; `{ block, inline }` sets that and the distance from the
   * side. To set it from CSS instead (only below a breakpoint, say) use the `--cy-toast-offset-block` and
   * `--cy-toast-offset-inline` tokens; this prop wins over them. Default: none.
   */
  offset?: ToastOffsetLength | ToastOffset | undefined;
  /** Replace the built-in English text: the region's name and the close button's name. */
  labels?: Partial<ToastLabels>;
  /** Added to the notifications region, for layout. */
  className?: string;
  /** Layout only, applied to the region. Restyle through --cy-toast-* tokens. */
  style?: CSSProperties;
  /** The part of the app that can call `useToast()`. */
  children?: ReactNode;
}

interface Item extends ToastOptions {
  id: string;
  /** Counts updates, so an update restarts the timer even when its duration is unchanged. */
  version: number;
  leaving?: boolean;
}

const DEFAULT_LABELS: ToastLabels = { region: "Notifications", dismiss: "Dismiss" };
/** Horizontal distance a touch has to travel to swipe a toast away. */
const SWIPE = 64;

const length = (value: ToastOffsetLength) => (/^(\d|10)$/.test(value) ? space(value as Space) : value);
/** The private custom properties toast.css reads the `offset` prop from; an axis that is not set is left to the token. */
function offsetVars(offset: ToasterProps["offset"]) {
  const { block, inline }: ToastOffset = typeof offset === "object" ? offset : { block: offset };
  const vars: Record<string, string> = {};
  if (block) vars["--_offset-block"] = length(block);
  if (inline) vars["--_offset-inline"] = length(inline);
  return vars;
}

const ToastContext = createContext<ToastApi | null>(null);

/** `toast()` and `dismiss()` for the nearest `<Toaster>`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast() needs a <Toaster> around it.");
  return api;
}

type RegionEl = HTMLElement & { showPopover?: () => void; hidePopover?: () => void };

/** What a toast keeps when its element is re-created (the region moved into or out of a Dialog). */
interface Memory {
  announced: boolean;
  /** Time left on the timer of one version of the toast; an update starts a timer of its own. */
  remaining?: { version: number; ms: number };
}
type MemoryMap = Map<string, Memory>;

/**
 * Hosts toasts for everything inside it: a region in the top layer, a store per Toaster (no globals), timers that pause
 * while the pointer or focus is on a toast, and polite or assertive announcements.
 */
export function Toaster({
  position = "bottom-end",
  max = 3,
  offset,
  labels,
  className,
  style,
  children,
}: ToasterProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const prefix = useId();
  const count = useRef(0);
  const [items, setItems] = useState<Item[]>([]);
  // The store as of the last change, read synchronously by toast() and dismiss() (two calls in one handler see each
  // other), so updates find their toast and onDismiss is called outside a state updater, exactly once.
  const store = useRef<Item[]>([]);
  const commit = useCallback((next: Item[]) => {
    store.current = next;
    setItems(next);
  }, []);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const region = useRef<RegionEl>(null);
  const memory = useRef<MemoryMap>(new Map());
  // Containers lent by open modal Dialogs; the latest one hosts the region.
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  const registry = useMemo<ToastHostRegistry>(
    () => ({
      register: (el) => {
        setHosts((list) => [...list, el]);
        return () => setHosts((list) => list.filter((h) => h !== el));
      },
    }),
    [],
  );
  const host = hosts.at(-1) ?? null;

  const remove = useCallback(
    (id: string) => {
      memory.current.delete(id);
      commit(store.current.filter((t) => t.id !== id));
    },
    [commit],
  );
  const close = useCallback(
    (id: string | undefined, reason: ToastDismissReason) => {
      const ending = store.current.filter((t) => !t.leaving && (id === undefined || t.id === id));
      if (ending.length === 0) return;
      // Closing the toast that holds focus (its close button, from the keyboard): hand focus to the next toast's close
      // button, or let the region stop pausing if there is none.
      const active = deepActiveElement(region.current?.ownerDocument);
      const holder = active?.closest<HTMLElement>(".cy-toast");
      if (holder && region.current?.contains(holder) && (id === undefined || holder.dataset.id === id)) {
        const others = [
          ...region.current.querySelectorAll<HTMLElement>(
            ".cy-toast:not([data-collapsed]):not([data-leaving])",
          ),
        ];
        const next = id === undefined ? undefined : others.find((t) => t !== holder);
        const button = next ? [...next.querySelectorAll<HTMLElement>("button")].at(-1) : undefined;
        if (button) button.focus();
        else {
          (active as HTMLElement).blur();
          setFocused(false);
        }
      }
      commit(store.current.map((t) => (ending.includes(t) ? { ...t, leaving: true } : t)));
      for (const t of ending) t.onDismiss?.(t.id, reason);
    },
    [commit],
  );
  const dismiss = useCallback((id?: string) => close(id, "programmatic"), [close]);
  const toast = useCallback(
    ({ id: wanted, ...options }: ToastOptions) => {
      // The id of a toast still in the store: update it in place (one that was closing comes back).
      const current = wanted === undefined ? undefined : store.current.find((t) => t.id === wanted);
      if (current) {
        const next: Item = { ...options, id: current.id, version: current.version + 1 };
        commit(store.current.map((t) => (t === current ? next : t)));
        return current.id;
      }
      count.current += 1;
      const id = wanted ?? `${prefix}-${count.current}`;
      commit([...store.current, { ...options, id, version: 0 }]);
      return id;
    },
    [prefix, commit],
  );
  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  // The region lives in the top layer for as long as the Toaster is mounted, so live regions exist before content.
  // It is re-created when it moves into or out of a Dialog; showing it again puts it on top of that dialog.
  useClientLayoutEffect(() => {
    const el = region.current;
    el?.showPopover?.();
    return () => {
      if (el?.matches(":popover-open")) el.hidePopover?.();
    };
  }, [host]);
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

  const regionEl = (
    <section
      ref={region}
      aria-label={text.region}
      {...{ popover: "manual" }}
      className={className ? `cy-toaster ${className}` : "cy-toaster"}
      data-position={position}
      style={{ ...offsetVars(offset), ...style }}
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
          onDismiss={close}
          onRemoved={remove}
          memory={memory.current}
        />
      ))}
    </section>
  );

  return (
    <ToastContext.Provider value={api}>
      <ToastHostContext.Provider value={registry}>{children}</ToastHostContext.Provider>
      {host ? createPortal(regionEl, host) : regionEl}
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  item: Item;
  collapsed: boolean;
  paused: boolean;
  dismissLabel: string;
  onDismiss: (id: string, reason: ToastDismissReason) => void;
  onRemoved: (id: string) => void;
  memory: MemoryMap;
}

function ToastItem({ item, collapsed, paused, dismissLabel, onDismiss, onRemoved, memory }: ToastItemProps) {
  const {
    id,
    version,
    title,
    description,
    tone = "neutral",
    action,
    duration = 5000,
    loading = false,
    leaving = false,
  } = item;
  const el = useRef<HTMLDivElement>(null);
  // Survives the element being re-created (region moved into or out of a Dialog).
  const [mem] = useState<Memory>(() => {
    const found = memory.get(id) ?? { announced: false };
    memory.set(id, found);
    return found;
  });
  const [announcedBefore] = useState(mem.announced);
  // The live element exists (empty) first and its text arrives a moment later: screen readers announce text added to
  // a live region, and the text is added once, so the toast is announced once.
  // Already announced (re-created after a move): show the text at once, so nothing is inserted to announce again.
  const [ready, setReady] = useState(mem.announced);
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => {
      mem.announced = true;
      setReady(true);
    }, 50);
    return () => clearTimeout(t);
  }, [ready, mem]);

  // Collapsed and leaving toasts cannot be focused or clicked. Set as a property: React 18 drops `inert={true}`.
  useClientLayoutEffect(() => {
    if (el.current) el.current.inert = collapsed || leaving;
  }, [collapsed, leaving]);

  // Auto-dismiss, keeping the time already spent across pauses and moves. The time left lives in `mem`, read when the
  // timer starts: a re-created toast's effects run after the old one has saved it. An update (a new version) starts a
  // fresh timer; a loading toast has none until it is updated.
  useEffect(() => {
    if (paused || collapsed || leaving || loading || !Number.isFinite(duration) || duration <= 0) return;
    const started = Date.now();
    const left = mem.remaining?.version === version ? mem.remaining.ms : duration;
    const t = setTimeout(() => onDismiss(id, "timeout"), Math.max(left, 0));
    return () => {
      clearTimeout(t);
      mem.remaining = { version, ms: left - (Date.now() - started) };
    };
  }, [paused, collapsed, leaving, loading, duration, version, id, onDismiss, mem]);

  // Leaving: play the exit transition (none under reduced motion), then drop it from the store.
  useEffect(() => {
    if (!leaving) return;
    const node = el.current;
    const t = setTimeout(() => onRemoved(id), node ? transitionTime(getComputedStyle(node)) : 0);
    return () => clearTimeout(t);
  }, [leaving, id, onRemoved]);

  // A finger swipes the toast away sideways. A press on its buttons stays a tap; a vertical swipe scrolls (the
  // stylesheet's pan-y) and, like Escape, puts it back.
  useDrag(el, {
    touchAction: "css",
    onStart: (session) =>
      session.pointerType === "touch" &&
      !session.path.some((n) => n instanceof Element && n.matches("button, a") && el.current?.contains(n)),
    onMove: (session) => {
      el.current?.setAttribute("data-swiping", "");
      el.current?.style.setProperty("--_dx", `${session.delta.x}px`);
    },
    onEnd: (session, cancelled) => {
      el.current?.removeAttribute("data-swiping");
      if (!cancelled && Math.abs(session.delta.x) >= SWIPE) onDismiss(id, "user");
      else el.current?.style.removeProperty("--_dx");
    },
  });

  const icon = TONE_ICONS[tone];
  return (
    <div
      ref={el}
      // An alert announces whenever it appears; one already announced comes back as a status.
      role={tone === "danger" && !announcedBefore ? "alert" : "status"}
      aria-atomic="true"
      className="cy-toast"
      data-id={id}
      data-tone={tone}
      data-collapsed={collapsed || undefined}
      data-leaving={leaving || undefined}
    >
      {loading ? (
        <LoadingDots variant="spinner" size="md" className="cy-toast-icon" />
      ) : (
        icon && <Icon icon={icon} className="cy-toast-icon" />
      )}
      <div className="cy-toast-text cy-reset">
        {ready && (
          <>
            <span className="cy-toast-title cy-reset">{title}</span>
            {description && <span className="cy-toast-description cy-reset">{description}</span>}
          </>
        )}
      </div>
      {action && (
        <Button
          size="sm"
          variant="soft"
          tone={tone === "neutral" ? "accent" : tone}
          className="cy-toast-action"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      <IconButton
        icon={closeIcon}
        label={dismissLabel}
        variant="ghost"
        size="sm"
        wrapperClassName="cy-toast-dismiss"
        onClick={() => onDismiss(id, "user")}
      />
    </div>
  );
}
