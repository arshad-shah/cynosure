import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  Children,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useDirectionContext } from '../../theme/DirectionProvider.js';
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import {
  tabsContent,
  tabsIndicator,
  tabsListBase,
  tabsListEnclosed,
  tabsListFullWidth,
  tabsListLine,
  tabsListSoft,
  tabsListSolid,
  tabsRoot,
  tabsTriggerBase,
  tabsTriggerEnclosed,
  tabsTriggerLine,
  tabsTriggerNeutral,
  tabsTriggerSize,
  tabsTriggerSoft,
  tabsTriggerSolid,
} from './Tabs.css.js';

export type TabsVariant = 'line' | 'solid' | 'enclosed' | 'soft';
export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsColorScheme = 'accent' | 'neutral';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

interface TabsContextValue {
  variant: TabsVariant;
  size: TabsSize;
  colorScheme: TabsColorScheme;
  orientation: TabsOrientation;
  fullWidth: boolean;
  baseId: string;
  value: string;
  setValue: (v: string) => void;
  activationMode: TabsActivationMode;
  registerTrigger: (node: HTMLButtonElement | null, value: string) => () => void;
  focusTrigger: (target: 'first' | 'last' | 'next' | 'prev', from: HTMLButtonElement) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);
const useTabsContext = (): TabsContextValue => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs subcomponents must be used inside <Tabs>');
  return ctx;
};

/**
 * Props for the `Tabs` root.
 */
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'dir'> {
  /** Controlled active value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires with the next active value. */
  onValueChange?: (value: string) => void;
  /**
   * `automatic` activates each tab as soon as it receives keyboard focus;
   * `manual` requires a Space/Enter press. WAI-ARIA recommends `automatic`
   * for stable tab content, `manual` when activating a tab triggers a
   * costly transition.
   * @default "automatic"
   */
  activationMode?: TabsActivationMode;
  /**
   * Visual treatment for the trigger row. `line` underlines the active
   * tab; `solid` fills the active tab; `enclosed` draws a notched tab
   * sitting above a panel border; `soft` uses a tinted pill.
   * @default "line"
   */
  variant?: TabsVariant;
  /**
   * Size of the trigger row.
   * @default "md"
   */
  size?: TabsSize;
  /**
   * Active-state colour. `accent` uses the theme's accent ramp; `neutral`
   * stays in the neutral palette (useful for secondary tab strips).
   * @default "accent"
   */
  colorScheme?: TabsColorScheme;
  /**
   * Layout direction. Drives arrow-key navigation (←/→ for horizontal,
   * ↑/↓ for vertical).
   * @default "horizontal"
   */
  orientation?: TabsOrientation;
  /**
   * Make each trigger flex to fill the row evenly.
   * @default false
   */
  fullWidth?: boolean;
  /** Override the inherited locale direction. */
  dir?: 'ltr' | 'rtl';
}

/**
 * Tabs root. Owns active-value state, keyboard navigation, RTL handling,
 * and activation mode. The sliding active-tab indicator is auto-mounted
 * inside `<TabsList>` so consumers don't need to wire it up by hand.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    activationMode = 'automatic',
    variant = 'line',
    size = 'md',
    colorScheme = 'accent',
    orientation = 'horizontal',
    fullWidth = false,
    dir,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const baseId = useId();
  const triggersRef = useRef<Array<{ node: HTMLButtonElement; value: string }>>([]);
  const registerTrigger = useCallback((node: HTMLButtonElement | null, v: string) => {
    if (!node) return () => {};
    triggersRef.current.push({ node, value: v });
    return () => {
      const i = triggersRef.current.findIndex((t) => t.node === node);
      if (i >= 0) triggersRef.current.splice(i, 1);
    };
  }, []);
  const focusTrigger = useCallback<TabsContextValue['focusTrigger']>((target, from) => {
    const enabled = triggersRef.current
      .filter(({ node }) => !node.disabled)
      .map(({ node }) => node);
    if (enabled.length === 0) return;
    const idx = enabled.indexOf(from);
    const next =
      target === 'first'
        ? 0
        : target === 'last'
          ? enabled.length - 1
          : target === 'next'
            ? (idx + 1) % enabled.length
            : (idx - 1 + enabled.length) % enabled.length;
    enabled[next]?.focus();
  }, []);

  const ctxValue = useMemo<TabsContextValue>(
    () => ({
      variant,
      size,
      colorScheme,
      orientation,
      fullWidth,
      baseId,
      value,
      setValue,
      activationMode,
      registerTrigger,
      focusTrigger,
    }),
    [
      variant,
      size,
      colorScheme,
      orientation,
      fullWidth,
      baseId,
      value,
      setValue,
      activationMode,
      registerTrigger,
      focusTrigger,
    ],
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <div
        ref={ref}
        dir={dir}
        data-orientation={orientation}
        className={cn(tabsRoot, className)}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

const variantListClass: Record<TabsVariant, string> = {
  line: tabsListLine,
  solid: tabsListSolid,
  enclosed: tabsListEnclosed,
  soft: tabsListSoft,
};

/** Props for the trigger-row container. */
export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether arrow-key navigation wraps. (Always true here for parity.) */
  loop?: boolean;
  /** Accessible label for the tab list (use when no visible label is nearby). */
  'aria-label'?: string;
}

/**
 * Container for triggers. Auto-mounts the animated indicator (overridable
 * by passing `<TabsIndicator />` as a child if a consumer wants to position
 * it differently).
 */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, children, ...rest },
  ref,
) {
  const ctx = useTabsContext();
  // Detect whether the consumer has supplied their own indicator; if not,
  // append one. This lets the API stay implicit for 99% of cases while
  // still letting power users place the indicator manually.
  const hasIndicator = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === TabsIndicator,
  );
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={ctx.orientation}
      data-cynosure-variant={ctx.variant}
      data-orientation={ctx.orientation}
      className={cn(
        tabsListBase,
        variantListClass[ctx.variant],
        ctx.fullWidth ? tabsListFullWidth : undefined,
        className,
      )}
      {...rest}
    >
      {children}
      {hasIndicator ? null : <TabsIndicator />}
    </div>
  );
});

const triggerVariantClass: Record<TabsVariant, string> = {
  line: tabsTriggerLine,
  solid: tabsTriggerSolid,
  enclosed: tabsTriggerEnclosed,
  soft: tabsTriggerSoft,
};

/** Props for a single tab trigger. */
export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Identifier linking this trigger to its matching `<TabsContent>`. */
  value: string;
}

/**
 * Single tab trigger. Pulls its visual variant from the parent `Tabs`
 * context. Arrow keys move focus along the orientation axis, Home/End
 * jump to first/last; in `automatic` mode focus also activates.
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { className, value, disabled, onClick, onKeyDown, onFocus, ...rest },
  ref,
) {
  const ctx = useTabsContext();
  const direction = useDirectionContext();
  const isRtl = direction.dir === 'rtl';
  const isActive = ctx.value === value;
  const localRef = useRef<HTMLButtonElement | null>(null);
  const setRefs = useMemo(
    () =>
      composeRefs<HTMLButtonElement>(ref, (node) => {
        localRef.current = node;
      }),
    [ref],
  );

  useEffect(() => ctx.registerTrigger(localRef.current, value), [ctx, value]);

  const activate = () => {
    if (disabled) return;
    if (ctx.value !== value) ctx.setValue(value);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    activate();
  };
  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
    if (event.defaultPrevented) return;
    if (ctx.activationMode === 'automatic') activate();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const horizontal = ctx.orientation === 'horizontal';
    const nextKey = horizontal ? (isRtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const prevKey = horizontal ? (isRtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const target = event.currentTarget;
    if (event.key === nextKey) {
      event.preventDefault();
      ctx.focusTrigger('next', target);
    } else if (event.key === prevKey) {
      event.preventDefault();
      ctx.focusTrigger('prev', target);
    } else if (event.key === 'Home') {
      event.preventDefault();
      ctx.focusTrigger('first', target);
    } else if (event.key === 'End') {
      event.preventDefault();
      ctx.focusTrigger('last', target);
    } else if ((event.key === 'Enter' || event.key === ' ') && ctx.activationMode === 'manual') {
      event.preventDefault();
      activate();
    }
  };

  return (
    <button
      ref={setRefs}
      type="button"
      role="tab"
      id={`${ctx.baseId}-trigger-${value}`}
      aria-controls={`${ctx.baseId}-content-${value}`}
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      data-orientation={ctx.orientation}
      data-disabled={disabled || undefined}
      data-cynosure-value={value}
      disabled={disabled}
      // Roving tabindex: only the active trigger is reachable via Tab; arrow
      // keys move focus between the others.
      tabIndex={isActive ? 0 : -1}
      className={cn(
        tabsTriggerBase,
        tabsTriggerSize[ctx.size],
        triggerVariantClass[ctx.variant],
        ctx.colorScheme === 'neutral' ? tabsTriggerNeutral : undefined,
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...rest}
    />
  );
});

/** Props for a tab panel. */
export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Identifier matching the trigger's `value`. */
  value: string;
  /** Keep the panel mounted while inactive (preserves child state). */
  forceMount?: boolean;
  children?: ReactNode;
}

/**
 * Panel revealed when its matching `TabsTrigger` is active. Wired with
 * `role="tabpanel"`, `aria-labelledby`, and matching id.
 */
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { className, value, forceMount, hidden, ...rest },
  ref,
) {
  const ctx = useTabsContext();
  const isActive = ctx.value === value;
  if (!forceMount && !isActive) return null;
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${ctx.baseId}-content-${value}`}
      aria-labelledby={`${ctx.baseId}-trigger-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      data-orientation={ctx.orientation}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA tabpanel pattern — the panel must be focusable so keyboard users tabbing out of the tablist land inside the panel content.
      tabIndex={0}
      hidden={hidden ?? (forceMount ? !isActive : undefined)}
      className={cn(tabsContent, className)}
      {...rest}
    />
  );
});

/**
 * Props for the sliding active-tab indicator. Pure styling — geometry is
 * measured from the live DOM, so there are no value / position inputs.
 */
export interface TabsIndicatorProps {
  className?: string;
  style?: CSSProperties;
}

interface IndicatorMetrics {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The sliding indicator. Auto-mounted by `<TabsList>` — consumers only ever
 * need to render it explicitly when they want it elsewhere in the tree
 * (e.g. positioned in a separate scroll container). The shape is driven by
 * the parent variant via `data-cynosure-variant`; only the geometry is set
 * from JS, so motion stays cheap and GPU-compositable.
 */
export const TabsIndicator = forwardRef<HTMLSpanElement, TabsIndicatorProps>(function TabsIndicator(
  { className, style },
  ref,
) {
  const ctx = useTabsContext();
  const [metrics, setMetrics] = useState<IndicatorMetrics | null>(null);
  const nodeRef = useRef<HTMLSpanElement | null>(null);

  const measure = useCallback(() => {
    const node = nodeRef.current;
    if (!node) return;
    const list = node.parentElement;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active) {
      setMetrics(null);
      return;
    }
    const listBox = list.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    setMetrics({
      left: activeBox.left - listBox.left + list.scrollLeft,
      top: activeBox.top - listBox.top + list.scrollTop,
      width: activeBox.width,
      height: activeBox.height,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const list = node.parentElement;
    if (!list) return;
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => measure());
      ro.observe(list);
      for (const child of Array.from(list.querySelectorAll('[role="tab"]'))) ro.observe(child);
      const mo = new MutationObserver(() => measure());
      mo.observe(list, {
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state'],
      });
      return () => {
        ro.disconnect();
        mo.disconnect();
      };
    }
    const mo = new MutationObserver(() => measure());
    mo.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state'],
    });
    return () => {
      mo.disconnect();
    };
  }, [measure]);

  const cssVars: CSSProperties & Record<string, string | number> = {};
  if (metrics) {
    cssVars['--cynosure-tabs-indicator-left'] = `${metrics.left}px`;
    cssVars['--cynosure-tabs-indicator-top'] = `${metrics.top}px`;
    cssVars['--cynosure-tabs-indicator-width'] = `${metrics.width}px`;
    cssVars['--cynosure-tabs-indicator-height'] = `${metrics.height}px`;
  }

  return (
    <span
      ref={(node) => {
        nodeRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      aria-hidden="true"
      data-cynosure-variant={ctx.variant}
      data-orientation={ctx.orientation}
      data-pending={metrics ? 'false' : 'true'}
      className={cn(tabsIndicator, className)}
      style={{ ...cssVars, ...style }}
    />
  );
});
