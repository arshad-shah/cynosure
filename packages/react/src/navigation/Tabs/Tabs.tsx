import * as RadixTabs from '@radix-ui/react-tabs';
import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ElementRef,
  createContext,
  forwardRef,
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
  tabsTriggerLineFallback,
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
  /** Set by `<TabsList>` when it mounts; lets `<TabsIndicator>` skip measuring. */
  hasIndicator: boolean;
  setHasIndicator: (value: boolean) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = (): TabsContextValue => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs subcomponents must be used inside <Tabs>');
  return ctx;
};

export interface TabsProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixTabs.Root>, 'orientation'> {
  variant?: TabsVariant;
  size?: TabsSize;
  colorScheme?: TabsColorScheme;
  orientation?: TabsOrientation;
  fullWidth?: boolean;
}

/**
 * Tabs root — thin wrapper around `@radix-ui/react-tabs`. Keyboard
 * navigation, RTL handling, and activation mode all come from Radix; we layer
 * Cynosure visual variants and an animated underline indicator on top.
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
  const [hasIndicator, setHasIndicator] = useState(false);

  return (
    <TabsContext.Provider
      value={{
        variant,
        size,
        colorScheme,
        orientation,
        fullWidth,
        hasIndicator,
        setHasIndicator,
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

export interface TabsListProps extends ComponentPropsWithoutRef<typeof RadixTabs.List> {}

/**
 * Container for triggers. Tracks the active trigger's position via a
 * ResizeObserver so `<TabsIndicator>` can animate between tabs smoothly.
 */
export const TabsList = forwardRef<ElementRef<typeof RadixTabs.List>, TabsListProps>(
  function TabsList({ className, children, ...rest }, ref) {
    const ctx = useTabsContext();
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

export interface TabsTriggerProps extends ComponentPropsWithoutRef<typeof RadixTabs.Trigger> {}

export const TabsTrigger = forwardRef<ElementRef<typeof RadixTabs.Trigger>, TabsTriggerProps>(
  function TabsTrigger({ className, ...rest }, ref) {
    const ctx = useTabsContext();
    const baseVariantClass = triggerVariantClass[ctx.variant];
    // When variant="line" has no animated indicator rendered, fall back to a
    // static active border on the trigger so the UI stays readable.
    const needsFallback = ctx.variant === 'line' && !ctx.hasIndicator;
    return (
      <RadixTabs.Trigger
        ref={ref}
        data-cynosure-value={rest.value}
        className={cn(
          tabsTriggerBase,
          tabsTriggerSize[ctx.size],
          baseVariantClass,
          needsFallback ? tabsTriggerLineFallback : undefined,
          ctx.colorScheme === 'neutral' ? tabsTriggerNeutral : undefined,
          className,
        )}
        {...rest}
      />
    );
  },
);

export interface TabsContentProps extends ComponentPropsWithoutRef<typeof RadixTabs.Content> {}

export const TabsContent = forwardRef<ElementRef<typeof RadixTabs.Content>, TabsContentProps>(
  function TabsContent({ className, ...rest }, ref) {
    return <RadixTabs.Content ref={ref} className={cn(tabsContent, className)} {...rest} />;
  },
);

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
 * Absolutely-positioned underline (or right-rule, in vertical mode) that
 * animates between the active trigger's bounding box. The effect is
 * opt-in — only renders if the consumer includes `<TabsIndicator />` inside
 * `<TabsList />`. Falls back to a static trigger border when omitted.
 */
export const TabsIndicator = forwardRef<HTMLSpanElement, TabsIndicatorProps>(function TabsIndicator(
  { className, style },
  ref,
) {
  const ctx = useTabsContext();
  const [metrics, setMetrics] = useState<IndicatorMetrics | null>(null);
  const pendingRef = useRef(true);
  const nodeRef = useRef<HTMLSpanElement | null>(null);

  // Tell the root we're mounted so triggers drop their fallback border.
  useEffect(() => {
    ctx.setHasIndicator(true);
    return () => ctx.setHasIndicator(false);
  }, [ctx.setHasIndicator]);

  const measure = useCallback(() => {
    const node = nodeRef.current;
    if (!node) return;
    const list = node.parentElement;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active) {
      setMetrics(null);
      pendingRef.current = true;
      return;
    }
    const listBox = list.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    pendingRef.current = false;
    setMetrics({
      left: activeBox.left - listBox.left + list.scrollLeft,
      top: activeBox.top - listBox.top + list.scrollTop,
      width: activeBox.width,
      height: activeBox.height,
    });
  }, []);

  // Re-measure on mount + whenever any trigger flips `data-state`.
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
      data-orientation={ctx.orientation}
      data-pending={metrics ? 'false' : 'true'}
      className={cn(tabsIndicator, className)}
      style={{ ...cssVars, ...style }}
    />
  );
});
