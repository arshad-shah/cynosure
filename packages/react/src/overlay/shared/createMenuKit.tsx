import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { ChevronRight } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type ReactNode,
  type RefAttributes,
  forwardRef,
} from 'react';
import { Checkbox } from '../../forms/Checkbox/Checkbox.js';
import { Radio } from '../../forms/Radio/Radio.js';
import { Kbd } from '../../typography/Kbd/Kbd.js';
import { cn } from '../../utils/cn.js';
import {
  menuFormIndicator,
  menuFormIndicatorGroup,
  menuFormIndicatorOverlay,
} from './createMenuKit.css.js';
import {
  menuContent,
  menuItem,
  menuLabel,
  menuSeparator,
  menuShortcut,
  menuSubChevron,
} from './menu.css.js';
import { MenuItemContent } from './menuItemContent.js';

/**
 * Structural type for the Radix menu namespaces we support. Each of
 * `@radix-ui/react-dropdown-menu`, `react-context-menu`, and `react-menubar`
 * exposes these primitives with the same prop shape — only the runtime
 * component identities differ.
 */
export interface MenuNamespace {
  Portal: ComponentType<{
    container?: Element | DocumentFragment | null;
    children?: ReactNode;
  }>;
  Content: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & Record<string, unknown> & RefAttributes<HTMLDivElement>
  >;
  SubContent: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & Record<string, unknown> & RefAttributes<HTMLDivElement>
  >;
  Item: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & Record<string, unknown> & RefAttributes<HTMLDivElement>
  >;
  CheckboxItem: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & {
      checked?: boolean | 'indeterminate';
    } & Record<string, unknown> &
      RefAttributes<HTMLDivElement>
  >;
  RadioItem: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & { value: string } & Record<string, unknown> &
      RefAttributes<HTMLDivElement>
  >;
  SubTrigger: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & Record<string, unknown> & RefAttributes<HTMLDivElement>
  >;
  Label: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & Record<string, unknown> & RefAttributes<HTMLDivElement>
  >;
  Separator: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & Record<string, unknown> & RefAttributes<HTMLDivElement>
  >;
  ItemIndicator: ComponentType<HTMLAttributes<HTMLSpanElement> & { children?: ReactNode }>;
}

export type MenuItemVariant = 'default' | 'danger';

/**
 * Props added on top of Radix's item props. Applies to Item, CheckboxItem,
 * RadioItem, and SubTrigger.
 */
export interface MenuItemExtraProps {
  /** Leading-slot icon. Ignored (with a dev warning) on CheckboxItem/RadioItem since the indicator occupies the slot. */
  icon?: ReactNode;
  /** Muted second line under the label. */
  description?: ReactNode;
  /** `'danger'` recolors label and highlight fill. */
  variant?: MenuItemVariant;
}

function warnIconOnIndicator(kind: 'CheckboxItem' | 'RadioItem', icon: ReactNode): void {
  if (
    icon != null &&
    typeof import.meta !== 'undefined' &&
    (import.meta as { env?: { DEV?: boolean } }).env?.DEV
  ) {
    console.warn(
      `[cynosure] Menu ${kind} received an \`icon\` prop — the indicator occupies the slot, so the icon is ignored.`,
    );
  }
}

export type MenuContentProps<N extends MenuNamespace> = Omit<
  ComponentPropsWithoutRef<N['Content']>,
  'asChild'
> & {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
  className?: string;
};

export type MenuSubContentProps<N extends MenuNamespace> = ComponentPropsWithoutRef<
  N['SubContent']
> & {
  className?: string;
};

export type MenuItemProps<N extends MenuNamespace> = ComponentPropsWithoutRef<N['Item']> &
  MenuItemExtraProps & { className?: string };

export type MenuCheckboxItemProps<N extends MenuNamespace> = ComponentPropsWithoutRef<
  N['CheckboxItem']
> &
  MenuItemExtraProps & { className?: string };

export type MenuRadioItemProps<N extends MenuNamespace> = ComponentPropsWithoutRef<N['RadioItem']> &
  MenuItemExtraProps & { className?: string };

export type MenuSubTriggerProps<N extends MenuNamespace> = ComponentPropsWithoutRef<
  N['SubTrigger']
> &
  MenuItemExtraProps & { className?: string };

export interface MenuKit<N extends MenuNamespace> {
  Content: ForwardRefExoticComponent<MenuContentProps<N> & RefAttributes<HTMLDivElement>>;
  SubContent: ForwardRefExoticComponent<MenuSubContentProps<N> & RefAttributes<HTMLDivElement>>;
  Item: ForwardRefExoticComponent<MenuItemProps<N> & RefAttributes<HTMLDivElement>>;
  CheckboxItem: ForwardRefExoticComponent<MenuCheckboxItemProps<N> & RefAttributes<HTMLDivElement>>;
  RadioItem: ForwardRefExoticComponent<MenuRadioItemProps<N> & RefAttributes<HTMLDivElement>>;
  SubTrigger: ForwardRefExoticComponent<MenuSubTriggerProps<N> & RefAttributes<HTMLDivElement>>;
  Label: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<N['Label']> & { className?: string } & RefAttributes<HTMLDivElement>
  >;
  Separator: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<N['Separator']> & {
      className?: string;
    } & RefAttributes<HTMLDivElement>
  >;
  Shortcut: ForwardRefExoticComponent<
    HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement>
  >;
}

type AnyProps = Record<string, unknown>;

/**
 * Build a visually-bound kit of menu primitives for a given Radix menu
 * namespace (dropdown, context, or menubar). All three menus share one
 * implementation of the visual contract this way.
 */
export function createMenuKit<N extends MenuNamespace>(Radix: N): MenuKit<N> {
  const RadixContent = Radix.Content as unknown as ComponentType<AnyProps>;
  const RadixSubContent = Radix.SubContent as unknown as ComponentType<AnyProps>;
  const RadixItem = Radix.Item as unknown as ComponentType<AnyProps>;
  const RadixCheckboxItem = Radix.CheckboxItem as unknown as ComponentType<AnyProps>;
  const RadixRadioItem = Radix.RadioItem as unknown as ComponentType<AnyProps>;
  const RadixSubTrigger = Radix.SubTrigger as unknown as ComponentType<AnyProps>;
  const RadixLabel = Radix.Label as unknown as ComponentType<AnyProps>;
  const RadixSeparator = Radix.Separator as unknown as ComponentType<AnyProps>;
  const RadixItemIndicator = Radix.ItemIndicator as unknown as ComponentType<
    { children?: ReactNode; className?: string } & AnyProps
  >;
  const RadixPortal = Radix.Portal as unknown as ComponentType<{
    container?: Element | DocumentFragment | null;
    children?: ReactNode;
  }>;

  interface InnerContentProps {
    className?: string;
    container?: HTMLElement | (() => HTMLElement);
    children?: ReactNode;
  }
  interface InnerItemProps extends MenuItemExtraProps {
    className?: string;
    children?: ReactNode;
  }
  interface InnerPassThroughProps {
    className?: string;
    children?: ReactNode;
  }

  const Content = forwardRef<HTMLDivElement, InnerContentProps>(function Content(
    { className, container, children, ...rest },
    ref,
  ) {
    const resolvedContainer = typeof container === 'function' ? container() : container;
    return (
      <RadixPortal container={resolvedContainer ?? null}>
        <RadixContent
          ref={ref}
          data-cynosure-overlay=""
          {...(rest as AnyProps)}
          className={cn(menuContent, className)}
        >
          {children}
        </RadixContent>
      </RadixPortal>
    );
  });

  const SubContent = forwardRef<HTMLDivElement, InnerPassThroughProps>(function SubContent(
    { className, ...rest },
    ref,
  ) {
    return (
      <RadixPortal>
        <RadixSubContent
          ref={ref}
          data-cynosure-overlay=""
          {...(rest as AnyProps)}
          className={cn(menuContent, className)}
        />
      </RadixPortal>
    );
  });

  const Item = forwardRef<HTMLDivElement, InnerItemProps>(function Item(
    { className, icon, description, variant = 'default', children, ...rest },
    ref,
  ) {
    return (
      <RadixItem
        ref={ref}
        data-variant={variant === 'danger' ? 'danger' : undefined}
        {...(rest as AnyProps)}
        className={cn(menuItem, className)}
      >
        <MenuItemContent leading={icon} description={description}>
          {children}
        </MenuItemContent>
      </RadixItem>
    );
  });

  const CheckboxItem = forwardRef<HTMLDivElement, InnerItemProps>(function CheckboxItem(
    { className, icon, description, variant = 'default', children, ...rest },
    ref,
  ) {
    warnIconOnIndicator('CheckboxItem', icon);
    return (
      <RadixCheckboxItem
        ref={ref}
        data-variant={variant === 'danger' ? 'danger' : undefined}
        {...(rest as AnyProps)}
        className={cn(menuItem, className)}
      >
        <MenuItemContent
          leading={
            <span className={menuFormIndicator} aria-hidden="true">
              <Checkbox size="sm" checked={false} onCheckedChange={() => {}} />
              <RadixItemIndicator className={menuFormIndicatorOverlay}>
                <Checkbox size="sm" checked={true} onCheckedChange={() => {}} />
              </RadixItemIndicator>
            </span>
          }
          description={description}
        >
          {children}
        </MenuItemContent>
      </RadixCheckboxItem>
    );
  });

  const RadioItem = forwardRef<HTMLDivElement, InnerItemProps>(function RadioItem(
    { className, icon, description, variant = 'default', children, ...rest },
    ref,
  ) {
    warnIconOnIndicator('RadioItem', icon);
    return (
      <RadixRadioItem
        ref={ref}
        data-variant={variant === 'danger' ? 'danger' : undefined}
        {...(rest as AnyProps)}
        className={cn(menuItem, className)}
      >
        <MenuItemContent
          leading={
            <span className={menuFormIndicator} aria-hidden="true">
              <RadixRadioGroup.Root value="" className={menuFormIndicatorGroup}>
                <Radio value="on" size="sm" />
              </RadixRadioGroup.Root>
              <RadixItemIndicator className={menuFormIndicatorOverlay}>
                <RadixRadioGroup.Root value="on" className={menuFormIndicatorGroup}>
                  <Radio value="on" size="sm" />
                </RadixRadioGroup.Root>
              </RadixItemIndicator>
            </span>
          }
          description={description}
        >
          {children}
        </MenuItemContent>
      </RadixRadioItem>
    );
  });

  const SubTrigger = forwardRef<HTMLDivElement, InnerItemProps>(function SubTrigger(
    { className, icon, description, variant = 'default', children, ...rest },
    ref,
  ) {
    return (
      <RadixSubTrigger
        ref={ref}
        data-variant={variant === 'danger' ? 'danger' : undefined}
        {...(rest as AnyProps)}
        className={cn(menuItem, className)}
      >
        <MenuItemContent
          leading={icon}
          description={description}
          trailing={
            <span className={menuSubChevron} aria-hidden="true">
              <ChevronRight size={14} aria-hidden="true" />
            </span>
          }
        >
          {children}
        </MenuItemContent>
      </RadixSubTrigger>
    );
  });

  const Label = forwardRef<HTMLDivElement, InnerPassThroughProps>(function Label(
    { className, ...rest },
    ref,
  ) {
    return <RadixLabel ref={ref} {...(rest as AnyProps)} className={cn(menuLabel, className)} />;
  });

  const Separator = forwardRef<HTMLDivElement, InnerPassThroughProps>(function Separator(
    { className, ...rest },
    ref,
  ) {
    return (
      <RadixSeparator ref={ref} {...(rest as AnyProps)} className={cn(menuSeparator, className)} />
    );
  });

  /** Keyboard-shortcut keycap. Renders cynosure's `<Kbd>` so glyphs look like keycaps, not plain text. Decorative — not announced. */
  /**
   * Keyboard-shortcut cluster. Splits a string like "⌘R" into per-key
   * `<Kbd>` keycaps so each glyph gets its own chip — avoids the cramped
   * "two-symbols-in-one-box" look. Non-string children render as a single
   * keycap unchanged. Decorative — not announced.
   */
  const Shortcut = forwardRef<HTMLSpanElement, { className?: string; children?: ReactNode }>(
    function Shortcut({ className, children }, ref) {
      const keys =
        typeof children === 'string'
          ? Array.from(children).filter((c) => c.trim().length > 0)
          : null;
      return (
        <span ref={ref} className={cn(menuShortcut, className)} aria-hidden="true">
          {keys != null ? (
            keys.map((k, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static shortcut string; duplicates allowed.
              <Kbd key={i} size="sm">
                {k}
              </Kbd>
            ))
          ) : (
            <Kbd size="sm">{children}</Kbd>
          )}
        </span>
      );
    },
  );

  return {
    Content,
    SubContent,
    Item,
    CheckboxItem,
    RadioItem,
    SubTrigger,
    Label,
    Separator,
    Shortcut,
  } as unknown as MenuKit<N>;
}
