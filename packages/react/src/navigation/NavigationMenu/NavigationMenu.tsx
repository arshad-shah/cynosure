import { ChevronDown } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card } from '../../data-display/Card/Card.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useId } from '../../hooks/useId.js';
import { composeRefs } from '../../utils/composeRefs.js';
import {
  navigationMenuCaret,
  navigationMenuContent,
  navigationMenuIndicator,
  navigationMenuIndicatorArrow,
  navigationMenuLink,
  navigationMenuList,
  navigationMenuRoot,
  navigationMenuTrigger,
} from './NavigationMenu.css.js';

/*
 * First-party navigation menu. Replaces `@radix-ui/react-navigation-menu` with
 * an in-tree implementation: a single open "value" identifies the active
 * top-level item, triggers open on hover/focus/click, and panels render in
 * place beneath their trigger (the default, non-viewport layout the CSS
 * targets). `<NavigationMenuViewport>` is kept as a compatibility no-op so
 * existing compositions keep type-checking.
 */

type AnyProps = Record<string, unknown>;
const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 150;

interface NavRootContextValue {
  value: string | null;
  open: (value: string) => void;
  close: (value: string) => void;
  /** Schedule a hover-intent open/close that a sibling interaction can cancel. */
  scheduleOpen: (value: string) => void;
  scheduleClose: () => void;
  cancelSchedule: () => void;
  registerTrigger: (value: string, el: HTMLElement | null) => void;
  activeTriggerEl: HTMLElement | null;
}

const NavRootContext = createContext<NavRootContextValue | null>(null);
const NavItemContext = createContext<{ value: string } | null>(null);

function useNavRoot(): NavRootContextValue {
  const ctx = useContext(NavRootContext);
  if (!ctx) throw new Error('NavigationMenu parts must be rendered inside <NavigationMenu>.');
  return ctx;
}

export interface NavigationMenuProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Reserved for API parity. */
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  delayDuration?: number;
  skipDelayDuration?: number;
}

/**
 * Horizontal top-nav with hover-to-reveal panels. The active item is tracked
 * by a single `value`; opening one panel closes the others.
 */
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  {
    className,
    children,
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation: _orientation,
    dir: _dir,
    delayDuration: _delayDuration,
    skipDelayDuration: _skipDelayDuration,
    onPointerLeave,
    ...rest
  },
  ref,
) {
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: (next) => {
      if (next != null) onValueChange?.(next);
    },
  });
  const triggersRef = useRef<Map<string, HTMLElement>>(new Map());
  const [activeTriggerEl, setActiveTriggerEl] = useState<HTMLElement | null>(null);
  const timerRef = useRef<number>(0);

  const cancelSchedule = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = 0;
  }, []);

  const open = useCallback(
    (next: string) => {
      cancelSchedule();
      setValue(next);
      setActiveTriggerEl(triggersRef.current.get(next) ?? null);
    },
    [cancelSchedule, setValue],
  );

  const close = useCallback(
    (which: string) => {
      cancelSchedule();
      setValue((prev) => (prev === which ? (null as unknown as string) : prev));
    },
    [cancelSchedule, setValue],
  );

  const scheduleOpen = useCallback(
    (next: string) => {
      cancelSchedule();
      timerRef.current = window.setTimeout(() => open(next), HOVER_OPEN_DELAY);
    },
    [cancelSchedule, open],
  );

  const scheduleClose = useCallback(() => {
    cancelSchedule();
    timerRef.current = window.setTimeout(
      () => setValue(null as unknown as string),
      HOVER_CLOSE_DELAY,
    );
  }, [cancelSchedule, setValue]);

  const registerTrigger = useCallback(
    (triggerValue: string, el: HTMLElement | null) => {
      if (el) triggersRef.current.set(triggerValue, el);
      else triggersRef.current.delete(triggerValue);
      if (value === triggerValue) setActiveTriggerEl(el);
    },
    [value],
  );

  const ctx = useMemo<NavRootContextValue>(
    () => ({
      value,
      open,
      close,
      scheduleOpen,
      scheduleClose,
      cancelSchedule,
      registerTrigger,
      activeTriggerEl,
    }),
    [
      value,
      open,
      close,
      scheduleOpen,
      scheduleClose,
      cancelSchedule,
      registerTrigger,
      activeTriggerEl,
    ],
  );

  return (
    <nav
      {...(rest as AnyProps)}
      ref={ref}
      className={cnJoin(navigationMenuRoot, className)}
      data-state={value ? 'open' : 'closed'}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        ctx.scheduleClose();
      }}
    >
      <NavRootContext.Provider value={ctx}>{children}</NavRootContext.Provider>
    </nav>
  );
});

// Local join helper — avoids importing the generic `cn` for this leaf module's
// two-argument calls while keeping `undefined`/`false` class names out.
function cnJoin(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface NavigationMenuListProps extends ComponentPropsWithoutRef<'ul'> {}

/** Horizontal `<ul>` of top-level `<NavigationMenuItem>`s. */
export const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuListProps>(
  function NavigationMenuList({ className, ...rest }, ref) {
    return <ul {...rest} ref={ref} className={cnJoin(navigationMenuList, className)} />;
  },
);

export interface NavigationMenuItemProps extends ComponentPropsWithoutRef<'li'> {
  value?: string;
}

/**
 * Single top-level cell. Hosts either a `NavigationMenuTrigger` +
 * `NavigationMenuContent` pair or a flat `NavigationMenuLink`.
 */
export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  function NavigationMenuItem({ className, value: valueProp, children, ...rest }, ref) {
    const generatedId = useId();
    const value = valueProp ?? generatedId;
    const itemCtx = useMemo(() => ({ value }), [value]);
    return (
      <li
        {...(rest as AnyProps)}
        ref={ref}
        className={className}
        style={{ position: 'relative', ...((rest as { style?: React.CSSProperties }).style ?? {}) }}
      >
        <NavItemContext.Provider value={itemCtx}>{children}</NavItemContext.Provider>
      </li>
    );
  },
);

export interface NavigationMenuTriggerProps extends ComponentPropsWithoutRef<'button'> {
  /** Suppress the built-in caret icon at the trigger's trailing edge. */
  hideChevron?: boolean;
}

/**
 * Top-level trigger. Opens its panel on hover (with hover-intent timing),
 * focus, or `Enter`/`Space`/`↓`.
 */
export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  function NavigationMenuTrigger(
    { className, children, hideChevron, onClick, onKeyDown, onPointerEnter, onFocus, ...rest },
    ref,
  ) {
    const root = useNavRoot();
    const item = useContext(NavItemContext);
    const value = item?.value ?? '';
    const isOpen = root.value === value;

    const setRef = useCallback(
      (node: HTMLElement | null) => root.registerTrigger(value, node),
      [root, value],
    );

    return (
      <button
        {...(rest as AnyProps)}
        ref={composeRefs(ref as React.Ref<HTMLElement>, setRef)}
        type="button"
        className={cnJoin(navigationMenuTrigger, className)}
        aria-expanded={isOpen}
        data-state={isOpen ? 'open' : 'closed'}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (isOpen) root.close(value);
          else root.open(value);
        }}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          // If a sibling panel is open, switch immediately; otherwise hover-open.
          if (root.value != null) root.open(value);
          else root.scheduleOpen(value);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          root.open(value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            root.open(value);
          } else if (event.key === 'Escape') {
            root.close(value);
          }
        }}
      >
        {children}
        {hideChevron ? null : (
          <span className={navigationMenuCaret} aria-hidden="true">
            <ChevronDown size={14} />
          </span>
        )}
      </button>
    );
  },
);

export interface NavigationMenuContentProps extends ComponentPropsWithoutRef<'div'> {
  /** Accepted for API parity; the panel always mounts only while open. */
  forceMount?: boolean;
}

/**
 * Floating panel rendered beneath its trigger while the item is open. The
 * surface is delegated to `<Card variant="elevated">`; this component owns
 * positioning, the dropdown z-layer, and the open/close animation.
 */
export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  function NavigationMenuContent(
    { className, children, forceMount: _forceMount, onPointerEnter, onPointerLeave, ...rest },
    ref,
  ) {
    const root = useNavRoot();
    const item = useContext(NavItemContext);
    const value = item?.value ?? '';
    if (root.value !== value) return null;
    return (
      <div
        {...(rest as AnyProps)}
        ref={ref}
        className={cnJoin(navigationMenuContent, className)}
        data-state="open"
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          root.cancelSchedule();
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          root.scheduleClose();
        }}
      >
        <Card variant="elevated" style={{ overflow: 'visible' }}>
          {children}
        </Card>
      </div>
    );
  },
);

export interface NavigationMenuLinkProps extends ComponentPropsWithoutRef<'a'> {
  /** Mark as the current page: sets `aria-current="page"` + `data-active`. */
  active?: boolean;
  children?: ReactNode;
}

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink({ className, active, ...rest }, ref) {
    return (
      <a
        {...(rest as AnyProps)}
        ref={ref}
        aria-current={active ? 'page' : undefined}
        data-active={active ? 'true' : undefined}
        className={cnJoin(navigationMenuLink, className)}
      />
    );
  },
);

export interface NavigationMenuIndicatorProps extends ComponentPropsWithoutRef<'div'> {}

/**
 * Caret that lines up under the active trigger. Tracks the open trigger's
 * horizontal position via a layout effect.
 */
export const NavigationMenuIndicator = forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  function NavigationMenuIndicator({ className, children, style, ...rest }, ref) {
    const root = useNavRoot();
    const visible = root.value != null && root.activeTriggerEl != null;
    const [offset, setOffset] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    useLayoutEffect(() => {
      const el = root.activeTriggerEl;
      if (!el) return;
      setOffset({ left: el.offsetLeft, width: el.offsetWidth });
    }, [root.activeTriggerEl]);

    if (!visible) return null;
    return (
      <div
        {...(rest as AnyProps)}
        ref={ref}
        className={cnJoin(navigationMenuIndicator, className)}
        data-state="visible"
        style={{
          width: offset.width,
          transform: `translateX(${offset.left}px)`,
          ...(style ?? {}),
        }}
      >
        {children ?? (
          <svg
            aria-hidden="true"
            className={navigationMenuIndicatorArrow}
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
          >
            <path
              d="M0.5 7.5 L7 1 L13.5 7.5"
              fill="currentColor"
              stroke="var(--cynosure-color-border-default)"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    );
  },
);

export interface NavigationMenuViewportProps extends ComponentPropsWithoutRef<'div'> {}

/**
 * Compatibility no-op. The first-party engine renders each panel in place
 * beneath its trigger, so a shared viewport isn't required; this component is
 * retained so existing `<NavigationMenuViewport />` compositions keep working.
 */
export const NavigationMenuViewport = forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  function NavigationMenuViewport() {
    return null;
  },
);

/** Sub-navigation for nested panels (rarely needed, exposed for parity). */
export function NavigationMenuSub({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
