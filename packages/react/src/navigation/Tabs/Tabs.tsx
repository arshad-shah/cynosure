import * as RadixTabs from '@radix-ui/react-tabs';
import {
  type CSSProperties,
  Children,
  type ComponentPropsWithoutRef,
  type ElementRef,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
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

interface TabsContextValue {
  variant: TabsVariant;
  size: TabsSize;
  colorScheme: TabsColorScheme;
  orientation: TabsOrientation;
  fullWidth: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = (): TabsContextValue => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs subcomponents must be used inside <Tabs>');
  return ctx;
};

/**
 * Props for the `Tabs` root. Forwards every Radix `Tabs.Root` prop
 * (`value`/`defaultValue`/`onValueChange`, `activationMode`, `dir`) plus
 * Cynosure's visual variants.
 */
export interface TabsProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixTabs.Root>, 'orientation'> {
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
   * Layout direction. Drives Radix's keyboard navigation (←/→ for
   * horizontal, ↑/↓ for vertical).
   * @default "horizontal"
   */
  orientation?: TabsOrientation;
  /**
   * Make each trigger flex to fill the row evenly.
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Tabs root — thin wrapper around `@radix-ui/react-tabs`. Keyboard navigation,
 * RTL handling, and activation mode all come from Radix; we layer the Cynosure
 * visual variants and the animated sliding indicator on top. The indicator
 * is auto-mounted inside `<TabsList>` so consumers don't need to wire it up
 * by hand.
 */
export const Tabs = forwardRef<ElementRef<typeof RadixTabs.Root>, TabsProps>(function Tabs(
  {
    variant = 'line',
    size = 'md',
    colorScheme = 'accent',
    orientation = 'horizontal',
    fullWidth = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <TabsContext.Provider
      value={{
        variant,
        size,
        colorScheme,
        orientation,
        fullWidth,
      }}
    >
      <RadixTabs.Root
        ref={ref}
        orientation={orientation}
        className={cn(tabsRoot, className)}
        {...rest}
      >
        {children}
      </RadixTabs.Root>
    </TabsContext.Provider>
  );
});

const variantListClass: Record<TabsVariant, string> = {
  line: tabsListLine,
  solid: tabsListSolid,
  enclosed: tabsListEnclosed,
  soft: tabsListSoft,
};

/**
 * Props for the trigger-row container. Forwards every Radix `Tabs.List`
 * prop (incl. `loop`).
 */
export interface TabsListProps extends ComponentPropsWithoutRef<typeof RadixTabs.List> {}

/**
 * Container for triggers. Auto-mounts the animated indicator (overridable
 * by passing `<TabsIndicator />` as a child if a consumer wants to position
 * it differently).
 */
export const TabsList = forwardRef<ElementRef<typeof RadixTabs.List>, TabsListProps>(
  function TabsList({ className, children, ...rest }, ref) {
    const ctx = useTabsContext();
    // Detect whether the consumer has supplied their own indicator; if not,
    // append one. This lets the API stay implicit for 99% of cases while
    // still letting power users place the indicator manually.
    const hasIndicator = Children.toArray(children).some(
      (child) => isValidElement(child) && child.type === TabsIndicator,
    );

    return (
      <RadixTabs.List
        ref={ref}
        data-cynosure-variant={ctx.variant}
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
      </RadixTabs.List>
    );
  },
);

const triggerVariantClass: Record<TabsVariant, string> = {
  line: tabsTriggerLine,
  solid: tabsTriggerSolid,
  enclosed: tabsTriggerEnclosed,
  soft: tabsTriggerSoft,
};

/**
 * Props for a single tab trigger. Forwards every Radix `Tabs.Trigger`
 * prop (incl. the required `value` linking to a matching `TabsContent`).
 */
export interface TabsTriggerProps extends ComponentPropsWithoutRef<typeof RadixTabs.Trigger> {}

/**
 * Single tab trigger. Pulls its visual variant from the parent `Tabs`
 * context; keyboard activation (`Enter`/`Space`) and roving focus come
 * from Radix.
 */
export const TabsTrigger = forwardRef<ElementRef<typeof RadixTabs.Trigger>, TabsTriggerProps>(
  function TabsTrigger({ className, ...rest }, ref) {
    const ctx = useTabsContext();
    return (
      <RadixTabs.Trigger
        ref={ref}
        data-cynosure-value={rest.value}
        className={cn(
          tabsTriggerBase,
          tabsTriggerSize[ctx.size],
          triggerVariantClass[ctx.variant],
          ctx.colorScheme === 'neutral' ? tabsTriggerNeutral : undefined,
          className,
        )}
        {...rest}
      />
    );
  },
);

/**
 * Props for a tab panel. Forwards every Radix `Tabs.Content` prop (incl.
 * the matching `value` and the `forceMount` escape hatch).
 */
export interface TabsContentProps extends ComponentPropsWithoutRef<typeof RadixTabs.Content> {}

/**
 * Panel revealed when its matching `TabsTrigger` is active. Wired with
 * `role="tabpanel"`, `aria-labelledby`, and focus management by Radix.
 */
export const TabsContent = forwardRef<ElementRef<typeof RadixTabs.Content>, TabsContentProps>(
  function TabsContent({ className, ...rest }, ref) {
    return <RadixTabs.Content ref={ref} className={cn(tabsContent, className)} {...rest} />;
  },
);

/**
 * Props for the sliding active-tab indicator. Pure styling — geometry is
 * measured from the live DOM, so there are no value / position inputs.
 */
export interface TabsIndicatorProps {
  /** Forward a `className` for additional styling. */
  className?: string;
  /** Inline styles merged with the JS-set CSS variables. */
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
 * the parent variant via `data-cynosure-variant`; only the geometry (left /
 * top / width / height) is set from JS, so motion stays cheap and
 * GPU-compositable.
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

  // Re-measure on mount and whenever any trigger flips `data-state`.
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
