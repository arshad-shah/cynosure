# DropdownMenu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `DropdownMenu`, `ContextMenu`, and `MenuBar` onto a shared menu-kit factory, elevate visual design, add typed `icon`/`description`/`variant` item props, and replace the `▾` ASCII trigger affordance with an animated chevron.

**Architecture:** Extract a Radix-namespace-generic factory (`createMenuKit`) in `overlay/shared/` that returns typed `Content` / `Item` / `CheckboxItem` / `RadioItem` / `SubTrigger` / `SubContent` / `Label` / `Separator` / `Shortcut` primitives. Each public menu file becomes a ~30-line binding. Visual polish lives in `overlay/shared/menu.css.ts` and is inherited by all three menus. Adds `DropdownMenuTriggerButton` (Button composed with animated chevron).

**Tech Stack:** React 18, TypeScript (strict), `@radix-ui/react-dropdown-menu`, `@radix-ui/react-context-menu`, `@radix-ui/react-menubar`, vanilla-extract CSS, vitest + @testing-library/react, Storybook.

**Spec:** `docs/superpowers/specs/2026-04-20-dropdown-menu-redesign-design.md`

---

## File Structure

**New files:**
- `packages/react/src/overlay/shared/menuIcons.tsx` — `CheckIcon`, `RadioDot`, `ChevronRight`, `ChevronDown`
- `packages/react/src/overlay/shared/menuItemContent.tsx` — layout wrapper: leading slot + label/description stack + trailing slot
- `packages/react/src/overlay/shared/createMenuKit.ts` — Radix-namespace generic factory
- `packages/react/src/overlay/shared/createMenuKit.css.ts` — description style + leading-slot style + chevron transition
- `packages/react/src/overlay/shared/MenuTriggerButton.tsx` — Button + animated chevron (exported from DropdownMenu)

**Modified:**
- `packages/react/src/overlay/shared/menu.css.ts` — shadow, cursor, padding, kbd chip, transform-origin, reduced-motion, danger variant
- `packages/react/src/overlay/DropdownMenu/DropdownMenu.tsx` — thin kit binding + `DropdownMenuTriggerButton` export
- `packages/react/src/overlay/DropdownMenu/index.ts` — add `DropdownMenuTriggerButton` re-export
- `packages/react/src/overlay/ContextMenu/ContextMenu.tsx` — thin kit binding
- `packages/react/src/overlay/MenuBar/MenuBar.tsx` — thin kit binding (Root + Trigger wrappers retained)
- `packages/react/src/overlay/DropdownMenu/DropdownMenu.stories.tsx` — drop `▾`, use `DropdownMenuTriggerButton`, demo new item props
- `packages/react/src/overlay/ContextMenu/ContextMenu.stories.tsx` — demo new item props
- `packages/react/src/overlay/MenuBar/MenuBar.stories.tsx` — demo new item props
- `packages/react/src/overlay/__tests__/DropdownMenu.test.tsx` — add kit-behavior assertions
- `packages/react/src/overlay/__tests__/ContextMenu.test.tsx` — add kit-behavior assertion

---

## Task 1: CSS polish in the shared stylesheet

**Why first:** Style changes are backward-compatible and shared across all three menus. Existing behavior tests pass unchanged.

**Files:**
- Modify: `packages/react/src/overlay/shared/menu.css.ts`

- [ ] **Step 1: Replace `menu.css.ts` entirely with the polished version**

Overwrite `packages/react/src/overlay/shared/menu.css.ts` with:

```ts
import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const menuIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
});

const menuOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0) scale(1)' },
  to: { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
});

/** Shared content shell — DropdownMenu, ContextMenu, MenuBar, sub-menus. */
export const menuContent = style({
  minWidth: '12rem',
  maxHeight: 'min(60vh, 20rem)',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: `0 1px 2px rgba(0,0,0,0.08), 0 12px 32px -8px rgba(0,0,0,0.18)`,
  overflow: 'auto',
  padding: vars.space['1.5'],
  zIndex: Number(vars.z.dropdown),
  outline: 'none',
  selectors: {
    '&[data-side="bottom"]': { transformOrigin: 'top center' },
    '&[data-side="top"]': { transformOrigin: 'bottom center' },
    '&[data-side="left"]': { transformOrigin: 'center right' },
    '&[data-side="right"]': { transformOrigin: 'center left' },
    '&[data-state="open"]': {
      animation: `${menuIn} ${vars.duration.fast} ease-out`,
    },
    '&[data-state="closed"]': {
      animation: `${menuOut} ${vars.duration.fast} ease-in`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

/** One item — MenuItem, CheckboxItem, RadioItem, SubTrigger. */
export const menuItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space['2'],
  position: 'relative',
  paddingBlock: vars.space['2'],
  paddingInline: vars.space['2'],
  paddingInlineStart: vars.space['2.5'],
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  userSelect: 'none',
  color: vars.color.foreground.default,
  outline: 'none',
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  transition: 'background-color 120ms ease, color 120ms ease',
  selectors: {
    '&[data-highlighted]': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&[data-state="open"]': {
      background: vars.color.accent.soft,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    '&[data-variant="danger"]': {
      color: vars.color.feedback.danger.solid,
    },
    '&[data-variant="danger"][data-highlighted]': {
      background: vars.color.feedback.danger.soft,
      color: vars.color.feedback.danger.solid,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

/** Legacy inline-start indicator — kept exported for back-compat; unused by the kit. */
export const menuIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/** Chevron at the inline-end edge of SubTrigger. */
export const menuSubChevron = style({
  marginInlineStart: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
});

/** Horizontal rule separator. */
export const menuSeparator = style({
  height: '1px',
  background: vars.color.border.subtle,
  marginBlock: vars.space['1'],
  marginInline: vars.space['1'],
});

/** Section label (non-interactive). */
export const menuLabel = style({
  paddingInline: vars.space['2.5'],
  paddingBlock: vars.space['1'],
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontWeight: 600,
  color: vars.color.foreground.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

/** Keyboard shortcut chip rendered at the inline-end of an item. */
export const menuShortcut = style({
  marginInlineStart: 'auto',
  paddingInline: vars.space['1'],
  paddingBlock: '0',
  fontSize: 'var(--cynosure-font-body-sm-size)',
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.xs,
  lineHeight: '1.5',
});

export const menubarRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['0.5'],
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  padding: vars.space['0.5'],
});

export const menubarTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  paddingBlock: vars.space['1'],
  paddingInline: vars.space['2'],
  border: 'none',
  background: 'transparent',
  color: vars.color.foreground.default,
  borderRadius: vars.radius.sm,
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  selectors: {
    '&[data-highlighted], &[data-state="open"]': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});
```

- [ ] **Step 2: Run existing menu tests; confirm all pass**

Run: `pnpm --filter @arshad-shah/cynosure-react test -- overlay/__tests__/DropdownMenu.test.tsx overlay/__tests__/ContextMenu.test.tsx overlay/__tests__/MenuBar.test.tsx`
Expected: all pass (behavior unchanged; only visuals changed).

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/overlay/shared/menu.css.ts
git commit -m "refactor(menu): polish shared menu styles — shadow, cursor, kbd chip, motion"
```

---

## Task 2: Shared menu icon set

**Files:**
- Create: `packages/react/src/overlay/shared/menuIcons.tsx`

- [ ] **Step 1: Create `menuIcons.tsx`**

```tsx
import type { ReactElement } from 'react';

export const CheckIcon = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 8l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RadioDot = (): ReactElement => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
    <circle cx="4" cy="4" r="3" />
  </svg>
);

export const ChevronRight = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m9 6 6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChevronDown = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/overlay/shared/menuIcons.tsx
git commit -m "feat(menu): extract shared menu icon set"
```

---

## Task 3: Menu item content layout + styles

**Files:**
- Create: `packages/react/src/overlay/shared/createMenuKit.css.ts`
- Create: `packages/react/src/overlay/shared/menuItemContent.tsx`

- [ ] **Step 1: Create `createMenuKit.css.ts`**

```ts
import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/** Fixed-width leading slot — absorbs icons, check/radio indicators, or blank space. */
export const menuLeadingSlot = style({
  flex: '0 0 auto',
  width: '1.25rem',
  height: '1.25rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'currentColor',
});

/** Label + description vertical stack; takes all remaining space. */
export const menuLabelStack = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: '1 1 auto',
  gap: '2px',
});

/** Primary label line. */
export const menuLabelText = style({
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
});

/** Muted second-line description. */
export const menuDescription = style({
  fontSize: 'var(--cynosure-font-body-xs-size)',
  lineHeight: 'var(--cynosure-font-body-xs-line-height)',
  color: vars.color.foreground.muted,
});

/** Animated down-chevron on DropdownMenuTriggerButton. */
export const triggerChevron = style({
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'transform 160ms cubic-bezier(0.2, 0, 0, 1)',
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(180deg)',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});
```

- [ ] **Step 2: Create `menuItemContent.tsx`**

```tsx
import type { ReactElement, ReactNode } from 'react';
import {
  menuDescription,
  menuLabelStack,
  menuLabelText,
  menuLeadingSlot,
} from './createMenuKit.css.js';

export interface MenuItemContentProps {
  /** Leading-slot node: an icon, a Radix ItemIndicator, or null. When null, the slot is reserved but empty. */
  leading?: ReactNode;
  /** Primary label text / nodes. */
  children: ReactNode;
  /** Optional muted second line. */
  description?: ReactNode;
  /** Trailing content — keyboard shortcut, sub-menu chevron, etc. */
  trailing?: ReactNode;
}

/**
 * Shared visual layout for a menu item. Produces the DOM structure all three
 * menus share: a fixed-width leading slot, a label/description stack, and an
 * optional trailing node.
 */
export function MenuItemContent({
  leading,
  children,
  description,
  trailing,
}: MenuItemContentProps): ReactElement {
  return (
    <>
      <span className={menuLeadingSlot} aria-hidden={leading == null ? 'true' : undefined}>
        {leading}
      </span>
      <span className={menuLabelStack}>
        <span className={menuLabelText}>{children}</span>
        {description != null ? (
          <span className={menuDescription}>{description}</span>
        ) : null}
      </span>
      {trailing}
    </>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/overlay/shared/createMenuKit.css.ts packages/react/src/overlay/shared/menuItemContent.tsx
git commit -m "feat(menu): add menuItemContent layout + kit css"
```

---

## Task 4: `createMenuKit` factory

**Files:**
- Create: `packages/react/src/overlay/shared/createMenuKit.ts`

- [ ] **Step 1: Create `createMenuKit.ts`**

```ts
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ElementRef,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type ReactNode,
  type RefAttributes,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import { CheckIcon, ChevronRight, RadioDot } from './menuIcons.js';
import { MenuItemContent } from './menuItemContent.js';
import {
  menuContent,
  menuItem,
  menuLabel,
  menuSeparator,
  menuShortcut,
  menuSubChevron,
} from './menu.css.js';

/**
 * Structural type for the Radix menu namespaces we support. Each of
 * `@radix-ui/react-dropdown-menu`, `react-context-menu`, and `react-menubar`
 * exposes these primitives with the same prop shape — only the runtime
 * component identities differ.
 */
export interface MenuNamespace {
  Portal: ComponentType<{ container?: Element | DocumentFragment | null; children?: ReactNode }>;
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
    ComponentPropsWithoutRef<'div'> & { checked?: boolean | 'indeterminate' } & Record<string, unknown> & RefAttributes<HTMLDivElement>
  >;
  RadioItem: ForwardRefExoticComponent<
    ComponentPropsWithoutRef<'div'> & { value: string } & Record<string, unknown> & RefAttributes<HTMLDivElement>
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
  if (icon != null && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      `[cynosure] Menu ${kind} received both an \`icon\` prop and an indicator slot — the indicator wins.`,
    );
  }
}

export interface MenuContentProps<N extends MenuNamespace>
  extends Omit<ComponentPropsWithoutRef<N['Content']>, 'asChild'> {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
  className?: string;
}

export interface MenuSubContentProps<N extends MenuNamespace>
  extends ComponentPropsWithoutRef<N['SubContent']> {
  className?: string;
}

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
    ComponentPropsWithoutRef<N['Separator']> & { className?: string } & RefAttributes<HTMLDivElement>
  >;
  Shortcut: ForwardRefExoticComponent<HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement>>;
}

/**
 * Build a visually-bound kit of menu primitives for a given Radix menu
 * namespace (dropdown, context, or menubar). All three menus share one
 * implementation of the visual contract this way.
 */
export function createMenuKit<N extends MenuNamespace>(Radix: N): MenuKit<N> {
  const Content = forwardRef<HTMLDivElement, MenuContentProps<N>>(function Content(
    { className, container, children, ...rest },
    ref,
  ) {
    const RadixContent = Radix.Content as unknown as ComponentType<Record<string, unknown>>;
    const RadixPortal = Radix.Portal as unknown as ComponentType<{
      container?: Element | DocumentFragment | null;
      children?: ReactNode;
    }>;
    const resolvedContainer = typeof container === 'function' ? container() : container;
    return (
      <RadixPortal container={resolvedContainer ?? null}>
        <RadixContent
          ref={ref}
          data-cynosure-overlay=""
          {...rest}
          className={cn(menuContent, className)}
        >
          {children}
        </RadixContent>
      </RadixPortal>
    );
  });

  const SubContent = forwardRef<HTMLDivElement, MenuSubContentProps<N>>(function SubContent(
    { className, ...rest },
    ref,
  ) {
    const RadixSubContent = Radix.SubContent as unknown as ComponentType<Record<string, unknown>>;
    const RadixPortal = Radix.Portal as unknown as ComponentType<{ children?: ReactNode }>;
    return (
      <RadixPortal>
        <RadixSubContent
          ref={ref}
          data-cynosure-overlay=""
          {...rest}
          className={cn(menuContent, className)}
        />
      </RadixPortal>
    );
  });

  const Item = forwardRef<HTMLDivElement, MenuItemProps<N>>(function Item(
    { className, icon, description, variant = 'default', children, ...rest },
    ref,
  ) {
    const RadixItem = Radix.Item as unknown as ComponentType<Record<string, unknown>>;
    return (
      <RadixItem
        ref={ref}
        data-variant={variant === 'danger' ? 'danger' : undefined}
        {...rest}
        className={cn(menuItem, className)}
      >
        <MenuItemContent leading={icon} description={description}>
          {children}
        </MenuItemContent>
      </RadixItem>
    );
  });

  const CheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps<N>>(function CheckboxItem(
    { className, icon, description, variant = 'default', children, ...rest },
    ref,
  ) {
    warnIconOnIndicator('CheckboxItem', icon);
    const RadixCheckboxItem = Radix.CheckboxItem as unknown as ComponentType<Record<string, unknown>>;
    const RadixItemIndicator = Radix.ItemIndicator as unknown as ComponentType<{ children?: ReactNode }>;
    return (
      <RadixCheckboxItem
        ref={ref}
        data-variant={variant === 'danger' ? 'danger' : undefined}
        {...rest}
        className={cn(menuItem, className)}
      >
        <MenuItemContent
          leading={
            <RadixItemIndicator>
              <CheckIcon />
            </RadixItemIndicator>
          }
          description={description}
        >
          {children}
        </MenuItemContent>
      </RadixCheckboxItem>
    );
  });

  const RadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps<N>>(function RadioItem(
    { className, icon, description, variant = 'default', children, ...rest },
    ref,
  ) {
    warnIconOnIndicator('RadioItem', icon);
    const RadixRadioItem = Radix.RadioItem as unknown as ComponentType<Record<string, unknown>>;
    const RadixItemIndicator = Radix.ItemIndicator as unknown as ComponentType<{ children?: ReactNode }>;
    return (
      <RadixRadioItem
        ref={ref}
        data-variant={variant === 'danger' ? 'danger' : undefined}
        {...rest}
        className={cn(menuItem, className)}
      >
        <MenuItemContent
          leading={
            <RadixItemIndicator>
              <RadioDot />
            </RadixItemIndicator>
          }
          description={description}
        >
          {children}
        </MenuItemContent>
      </RadixRadioItem>
    );
  });

  const SubTrigger = forwardRef<HTMLDivElement, MenuSubTriggerProps<N>>(function SubTrigger(
    { className, icon, description, variant = 'default', children, ...rest },
    ref,
  ) {
    const RadixSubTrigger = Radix.SubTrigger as unknown as ComponentType<Record<string, unknown>>;
    return (
      <RadixSubTrigger
        ref={ref}
        data-variant={variant === 'danger' ? 'danger' : undefined}
        {...rest}
        className={cn(menuItem, className)}
      >
        <MenuItemContent
          leading={icon}
          description={description}
          trailing={
            <span className={menuSubChevron} aria-hidden="true">
              <ChevronRight />
            </span>
          }
        >
          {children}
        </MenuItemContent>
      </RadixSubTrigger>
    );
  });

  const Label = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<N['Label']> & { className?: string }>(
    function Label({ className, ...rest }, ref) {
      const RadixLabel = Radix.Label as unknown as ComponentType<Record<string, unknown>>;
      return <RadixLabel ref={ref} {...rest} className={cn(menuLabel, className)} />;
    },
  );

  const Separator = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<N['Separator']> & { className?: string }
  >(function Separator({ className, ...rest }, ref) {
    const RadixSeparator = Radix.Separator as unknown as ComponentType<Record<string, unknown>>;
    return <RadixSeparator ref={ref} {...rest} className={cn(menuSeparator, className)} />;
  });

  /** Keyboard-shortcut chip. Purely decorative — not announced. */
  const Shortcut = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function Shortcut(
    { className, ...rest },
    ref,
  ) {
    return <span ref={ref} {...rest} className={cn(menuShortcut, className)} />;
  });

  return { Content, SubContent, Item, CheckboxItem, RadioItem, SubTrigger, Label, Separator, Shortcut };
}

// Suppress unused-type warning in case a consumer imports ElementRef via `MenuKit`.
export type _KeepElementRef = ElementRef<MenuNamespace['Content']>;
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors. If errors surface about `ComponentPropsWithoutRef<N['...']>`, widen the offending prop cast to `Record<string, unknown>` as shown elsewhere in the file.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/overlay/shared/createMenuKit.ts
git commit -m "feat(menu): add createMenuKit factory"
```

---

## Task 5: `MenuTriggerButton` (DropdownMenu affordance)

**Files:**
- Create: `packages/react/src/overlay/shared/MenuTriggerButton.tsx`

- [ ] **Step 1: Create `MenuTriggerButton.tsx`**

```tsx
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { type ElementRef, type ReactElement, forwardRef } from 'react';
import { Button, type ButtonProps } from '../../forms/Button/Button.js';
import { triggerChevron } from './createMenuKit.css.js';
import { ChevronDown } from './menuIcons.js';

export interface MenuTriggerButtonProps extends Omit<ButtonProps, 'asChild' | 'rightIcon'> {}

/**
 * Ergonomic DropdownMenu trigger: a Button with an animated chevron that
 * rotates 180° when the menu is open. Uses Radix's `data-state` on the
 * trigger element for the rotation — no additional wiring.
 */
export const MenuTriggerButton = forwardRef<
  ElementRef<typeof Button>,
  MenuTriggerButtonProps
>(function MenuTriggerButton({ children, ...rest }, ref): ReactElement {
  return (
    <RadixDropdown.Trigger asChild>
      <Button
        ref={ref}
        {...rest}
        rightIcon={
          <span className={triggerChevron} aria-hidden="true">
            <ChevronDown />
          </span>
        }
      >
        {children}
      </Button>
    </RadixDropdown.Trigger>
  );
});
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/overlay/shared/MenuTriggerButton.tsx
git commit -m "feat(menu): add MenuTriggerButton with animated chevron"
```

---

## Task 6: Migrate `DropdownMenu` to the kit

**Files:**
- Modify: `packages/react/src/overlay/DropdownMenu/DropdownMenu.tsx`
- Modify: `packages/react/src/overlay/DropdownMenu/index.ts`

- [ ] **Step 1: Replace `DropdownMenu.tsx` entirely**

```tsx
import * as Radix from '@radix-ui/react-dropdown-menu';
import { createMenuKit, type MenuNamespace } from '../shared/createMenuKit.js';
import { MenuTriggerButton } from '../shared/MenuTriggerButton.js';

const kit = createMenuKit(Radix as unknown as MenuNamespace);

export const DropdownMenu = Radix.Root;
export const DropdownMenuTrigger = Radix.Trigger;
export const DropdownMenuTriggerButton = MenuTriggerButton;
export const DropdownMenuPortal = Radix.Portal;
export const DropdownMenuGroup = Radix.Group;
export const DropdownMenuSub = Radix.Sub;
export const DropdownMenuRadioGroup = Radix.RadioGroup;

export const DropdownMenuContent = kit.Content;
export const DropdownMenuSubContent = kit.SubContent;
export const DropdownMenuItem = kit.Item;
export const DropdownMenuCheckboxItem = kit.CheckboxItem;
export const DropdownMenuRadioItem = kit.RadioItem;
export const DropdownMenuSubTrigger = kit.SubTrigger;
export const DropdownMenuLabel = kit.Label;
export const DropdownMenuSeparator = kit.Separator;
export const DropdownMenuShortcut = kit.Shortcut;

export type {
  MenuContentProps as DropdownMenuContentProps,
  MenuItemProps as DropdownMenuItemProps,
} from '../shared/createMenuKit.js';
```

Note: `DropdownMenuContentProps` and `DropdownMenuItemProps` are now type aliases over the kit's generic types — the public alias names are preserved so consumers aren't broken.

- [ ] **Step 2: Update `DropdownMenu/index.ts` to export `DropdownMenuTriggerButton`**

Read the current file, then replace it with:

```ts
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuTriggerButton,
} from './DropdownMenu.js';
export type { DropdownMenuContentProps, DropdownMenuItemProps } from './DropdownMenu.js';
```

- [ ] **Step 3: Run existing DropdownMenu tests; all must still pass**

Run: `pnpm --filter @arshad-shah/cynosure-react test -- overlay/__tests__/DropdownMenu.test.tsx`
Expected: all three tests pass. Behavior (ARIA roles, selection, checkbox toggle) is unchanged.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/overlay/DropdownMenu/DropdownMenu.tsx packages/react/src/overlay/DropdownMenu/index.ts
git commit -m "refactor(dropdown-menu): bind DropdownMenu to shared menu kit"
```

---

## Task 7: Add kit-behavior tests through DropdownMenu

**Files:**
- Modify: `packages/react/src/overlay/__tests__/DropdownMenu.test.tsx`

- [ ] **Step 1: Write the new failing tests**

Append the following cases inside the existing `describe('DropdownMenu', …)` block (before the closing `});`):

```tsx
  it('renders an icon in the leading slot and a description line', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            icon={<span data-testid="edit-icon">✎</span>}
            description="Change the document title"
          >
            Rename
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    expect(screen.getByText('Change the document title')).toBeInTheDocument();
  });

  it('applies data-variant="danger" when variant="danger" is set', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    const item = screen.getByRole('menuitem', { name: 'Delete' });
    expect(item).toHaveAttribute('data-variant', 'danger');
  });

  it('omits data-variant for the default variant', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    trigger.focus();
    await user.keyboard('{Enter}');
    const item = screen.getByRole('menuitem', { name: 'Rename' });
    expect(item).not.toHaveAttribute('data-variant');
  });

  it('DropdownMenuTriggerButton exposes data-state="open" when menu is open', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTriggerButton>Actions</DropdownMenuTriggerButton>
        <DropdownMenuContent>
          <DropdownMenuItem>First</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: /Actions/ });
    expect(trigger).toHaveAttribute('data-state', 'closed');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('data-state', 'open');
  });
```

Also extend the top-level import to include `DropdownMenuTriggerButton`:

```tsx
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuTriggerButton,
} from '../DropdownMenu/index.js';
```

- [ ] **Step 2: Run the new tests**

Run: `pnpm --filter @arshad-shah/cynosure-react test -- overlay/__tests__/DropdownMenu.test.tsx`
Expected: all tests pass (the implementation from Tasks 3–6 already supports the features being tested).

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/overlay/__tests__/DropdownMenu.test.tsx
git commit -m "test(dropdown-menu): cover icon/description/variant + trigger chevron"
```

---

## Task 8: Migrate `ContextMenu` to the kit

**Files:**
- Modify: `packages/react/src/overlay/ContextMenu/ContextMenu.tsx`

- [ ] **Step 1: Replace `ContextMenu.tsx` entirely**

```tsx
import * as Radix from '@radix-ui/react-context-menu';
import { createMenuKit, type MenuNamespace } from '../shared/createMenuKit.js';

const kit = createMenuKit(Radix as unknown as MenuNamespace);

/**
 * Right-click-triggered menu. Shares the visual contract with DropdownMenu and
 * MenuBar via the shared kit; the only behavioural difference is the trigger
 * event (contextmenu).
 */
export const ContextMenu = Radix.Root;
export const ContextMenuTrigger = Radix.Trigger;
export const ContextMenuPortal = Radix.Portal;
export const ContextMenuGroup = Radix.Group;
export const ContextMenuSub = Radix.Sub;
export const ContextMenuRadioGroup = Radix.RadioGroup;

export const ContextMenuContent = kit.Content;
export const ContextMenuSubContent = kit.SubContent;
export const ContextMenuItem = kit.Item;
export const ContextMenuCheckboxItem = kit.CheckboxItem;
export const ContextMenuRadioItem = kit.RadioItem;
export const ContextMenuSubTrigger = kit.SubTrigger;
export const ContextMenuLabel = kit.Label;
export const ContextMenuSeparator = kit.Separator;
export const ContextMenuShortcut = kit.Shortcut;

export type { MenuContentProps as ContextMenuContentProps } from '../shared/createMenuKit.js';
```

- [ ] **Step 2: Run existing ContextMenu tests**

Run: `pnpm --filter @arshad-shah/cynosure-react test -- overlay/__tests__/ContextMenu.test.tsx`
Expected: existing test passes.

- [ ] **Step 3: Add one kit-behavior test for ContextMenu**

Open `packages/react/src/overlay/__tests__/ContextMenu.test.tsx` and append inside the existing `describe('ContextMenu', …)` block:

```tsx
  it('passes data-variant="danger" through the kit', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger-area">Right-click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem variant="danger">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger-area'));
    const item = screen.getByRole('menuitem', { name: 'Delete' });
    expect(item).toHaveAttribute('data-variant', 'danger');
  });
```

- [ ] **Step 4: Run ContextMenu tests**

Run: `pnpm --filter @arshad-shah/cynosure-react test -- overlay/__tests__/ContextMenu.test.tsx`
Expected: both tests pass.

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/react/src/overlay/ContextMenu/ContextMenu.tsx packages/react/src/overlay/__tests__/ContextMenu.test.tsx
git commit -m "refactor(context-menu): bind ContextMenu to shared menu kit"
```

---

## Task 9: Migrate `MenuBar` to the kit

**Files:**
- Modify: `packages/react/src/overlay/MenuBar/MenuBar.tsx`

- [ ] **Step 1: Replace `MenuBar.tsx` entirely**

```tsx
import * as Radix from '@radix-ui/react-menubar';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { createMenuKit, type MenuNamespace } from '../shared/createMenuKit.js';
import { menubarRoot, menubarTrigger } from '../shared/menu.css.js';

const kit = createMenuKit(Radix as unknown as MenuNamespace);

/**
 * Application-style menu bar. Keyboard: arrow ←/→ moves between top-level
 * menus, ↓ opens, Esc closes. All semantics come from Radix; item visuals
 * come from the shared menu kit.
 */
export const MenuBarMenu: typeof Radix.Menu = Radix.Menu;
export const MenuBarPortal: typeof Radix.Portal = Radix.Portal;
export const MenuBarGroup: typeof Radix.Group = Radix.Group;
export const MenuBarSub: typeof Radix.Sub = Radix.Sub;
export const MenuBarRadioGroup: typeof Radix.RadioGroup = Radix.RadioGroup;

export const MenuBar = forwardRef<
  ElementRef<typeof Radix.Root>,
  ComponentPropsWithoutRef<typeof Radix.Root>
>(function MenuBar({ className, ...rest }, ref) {
  return <Radix.Root ref={ref} className={cn(menubarRoot, className)} {...rest} />;
});

export const MenuBarTrigger = forwardRef<
  ElementRef<typeof Radix.Trigger>,
  ComponentPropsWithoutRef<typeof Radix.Trigger>
>(function MenuBarTrigger({ className, ...rest }, ref) {
  return <Radix.Trigger ref={ref} className={cn(menubarTrigger, className)} {...rest} />;
});

export const MenuBarContent = kit.Content;
export const MenuBarSubContent = kit.SubContent;
export const MenuBarItem = kit.Item;
export const MenuBarCheckboxItem = kit.CheckboxItem;
export const MenuBarRadioItem = kit.RadioItem;
export const MenuBarSubTrigger = kit.SubTrigger;
export const MenuBarLabel = kit.Label;
export const MenuBarSeparator = kit.Separator;
export const MenuBarShortcut = kit.Shortcut;

export type { MenuContentProps as MenuBarContentProps } from '../shared/createMenuKit.js';
```

- [ ] **Step 2: Run existing MenuBar tests**

Run: `pnpm --filter @arshad-shah/cynosure-react test -- overlay/__tests__/MenuBar.test.tsx`
Expected: all tests pass.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/overlay/MenuBar/MenuBar.tsx
git commit -m "refactor(menubar): bind MenuBar item primitives to shared menu kit"
```

---

## Task 10: Update DropdownMenu stories — drop `▾`, use new API

**Files:**
- Modify: `packages/react/src/overlay/DropdownMenu/DropdownMenu.stories.tsx`

- [ ] **Step 1: Replace the stories file entirely**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuTriggerButton,
} from './DropdownMenu.js';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Overlays/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;

const IconEdit = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconCopy = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
const IconTrash = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton variant="outline">Actions</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithIconsAndShortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton>Document</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuLabel>Document</DropdownMenuLabel>
        <DropdownMenuItem icon={<IconEdit />}>
          Rename
          <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem icon={<IconCopy />}>
          Duplicate
          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<IconTrash />} variant="danger">
          Delete
          <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton variant="outline">Project</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuItem
          icon={<IconEdit />}
          description="Change the project title"
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={<IconCopy />}
          description="Create a copy in the same workspace"
        >
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={<IconTrash />}
          variant="danger"
          description="This action cannot be undone"
        >
          Delete permanently
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton variant="outline">File</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuItem>New</DropdownMenuItem>
        <DropdownMenuItem>Open…</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Send to…</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Slack</DropdownMenuItem>
                <DropdownMenuItem>Linear</DropdownMenuItem>
                <DropdownMenuItem>Notion</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Quit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const CheckboxItems: Story = {
  render: () => {
    function Checkboxes(): React.ReactElement {
      const [showGrid, setShowGrid] = useState(true);
      const [showRulers, setShowRulers] = useState(false);
      const [showGuides, setShowGuides] = useState(true);
      return (
        <Stack gap="3">
          <DropdownMenu>
            <DropdownMenuTriggerButton variant="outline">View</DropdownMenuTriggerButton>
            <DropdownMenuContent>
              <DropdownMenuLabel>Canvas</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
                Show grid
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
                Show rulers
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showGuides} onCheckedChange={setShowGuides}>
                Show guides
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Text size="sm" color="fg.muted">
            grid: {String(showGrid)} · rulers: {String(showRulers)} · guides: {String(showGuides)}
          </Text>
        </Stack>
      );
    }
    return <Checkboxes />;
  },
};

export const RadioItems: Story = {
  render: () => {
    function Radios(): React.ReactElement {
      const [theme, setTheme] = useState('system');
      return (
        <Stack gap="3">
          <DropdownMenu>
            <DropdownMenuTriggerButton variant="outline">Theme</DropdownMenuTriggerButton>
            <DropdownMenuContent>
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Text size="sm" color="fg.muted">
            Theme: <strong>{theme}</strong>
          </Text>
        </Stack>
      );
    }
    return <Radios />;
  },
};

export const Disabled: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTriggerButton variant="outline">Edit</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuItem>Undo</DropdownMenuItem>
        <DropdownMenuItem disabled>Redo</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Cut</DropdownMenuItem>
        <DropdownMenuItem>Copy</DropdownMenuItem>
        <DropdownMenuItem disabled>Paste</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const CustomTrigger: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">Custom (no chevron)</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>First</DropdownMenuItem>
        <DropdownMenuItem>Second</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Inline gap="3" align="center">
          <Button onClick={() => setOpen((o) => !o)}>Toggle menu</Button>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTriggerButton variant="outline">Controlled</DropdownMenuTriggerButton>
            <DropdownMenuContent>
              <DropdownMenuItem>First</DropdownMenuItem>
              <DropdownMenuItem>Second</DropdownMenuItem>
              <DropdownMenuItem>Third</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Text size="sm" color="fg.muted">
            open: <strong>{String(open)}</strong>
          </Text>
        </Inline>
      );
    }
    return <Controlled />;
  },
};
```

Note: the `DestructiveItem` story from the original file is replaced by the `WithIconsAndShortcuts` story demonstrating `variant="danger"`. The `▾` character no longer appears anywhere.

- [ ] **Step 2: Run Storybook build (smoke)**

Run: `pnpm --filter @arshad-shah/cynosure-react storybook:build`
Expected: build completes without errors. (If Storybook build is not configured at this package level, skip and rely on typecheck instead.)

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/overlay/DropdownMenu/DropdownMenu.stories.tsx
git commit -m "docs(dropdown-menu): drop ASCII chevron + demo icon/description/variant"
```

---

## Task 11: Update ContextMenu stories — demo new item props

**Files:**
- Modify: `packages/react/src/overlay/ContextMenu/ContextMenu.stories.tsx`

- [ ] **Step 1: Read the current file**

Read: `packages/react/src/overlay/ContextMenu/ContextMenu.stories.tsx` to understand its current story structure.

- [ ] **Step 2: Add a new `WithIconsAndVariants` story**

Append a new exported `Story` at the bottom of the file (keep all existing stories). Example — adapt imports if needed to match existing ones:

```tsx
const IconEdit = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconTrash = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const WithIconsAndVariants: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          style={{
            width: 240,
            height: 120,
            display: 'grid',
            placeItems: 'center',
            border: '1px dashed var(--cynosure-color-border-default)',
            borderRadius: 8,
          }}
        >
          Right-click me
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem icon={<IconEdit />} description="Change the file name">
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          icon={<IconTrash />}
          variant="danger"
          description="This action cannot be undone"
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
```

If `ContextMenuSeparator` isn't imported in the current file, add it to the imports.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/overlay/ContextMenu/ContextMenu.stories.tsx
git commit -m "docs(context-menu): demo icon/description/variant"
```

---

## Task 12: Update MenuBar stories — demo new item props

**Files:**
- Modify: `packages/react/src/overlay/MenuBar/MenuBar.stories.tsx`

- [ ] **Step 1: Read the current file**

Read: `packages/react/src/overlay/MenuBar/MenuBar.stories.tsx`.

- [ ] **Step 2: Update the existing file-menu story (or add a new one) to pass `icon`, `description`, and `variant="danger"` on representative `MenuBarItem` usages**

Example changes to add to at least one existing story (adapt to the real variable names in the file):

```tsx
<MenuBarItem
  icon={
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M12 5v14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  }
  description="Start a new blank document"
>
  New document
  <MenuBarShortcut>⌘N</MenuBarShortcut>
</MenuBarItem>

<MenuBarItem variant="danger">
  Close without saving
</MenuBarItem>
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/overlay/MenuBar/MenuBar.stories.tsx
git commit -m "docs(menubar): demo icon/description/variant"
```

---

## Task 13: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `pnpm --filter @arshad-shah/cynosure-react test`
Expected: all tests pass.

- [ ] **Step 2: Typecheck the whole package**

Run: `pnpm --filter @arshad-shah/cynosure-react typecheck`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `pnpm biome check`
Expected: no warnings or errors in the files we touched. If Biome autofixes formatting, commit those fixes separately:

```bash
git add -A
git commit -m "chore: biome format"
```

- [ ] **Step 4: Confirm `▾` is gone from the repo**

Run: `rg "▾" packages/react/src || echo "no ASCII chevrons remain"`
Expected: the `echo` fires — no matches. If anything remains, replace it following the patterns from Task 10.

- [ ] **Step 5: Confirm no duplicate icon definitions remain**

Run: `rg "const CheckIcon|const RadioDot|const ChevronRight" packages/react/src/overlay`
Expected: matches only inside `packages/react/src/overlay/shared/menuIcons.tsx`.

---

## Self-review notes (resolved)

- **Spec coverage:** every bullet in §Design of the spec maps to at least one task — CSS polish (Task 1), shared icons (Task 2), item content + chevron CSS (Task 3), factory (Task 4), TriggerButton (Task 5), DropdownMenu binding (Task 6), kit tests (Task 7), ContextMenu binding (Task 8), MenuBar binding (Task 9), stories (Tasks 10–12), verification (Task 13).
- **Placeholders:** none — every code step includes the concrete code.
- **Type consistency:** kit export names (`Content`, `Item`, `CheckboxItem`, `RadioItem`, `SubTrigger`, `SubContent`, `Label`, `Separator`, `Shortcut`) stay consistent across Tasks 4, 6, 8, 9. Public `DropdownMenuContentProps` / `DropdownMenuItemProps` aliases preserved.
- **Dark-mode inner highlight:** omitted — the theme mechanism in `vars.css.ts` isn't exposed at stylesheet authoring time, and the layered shadow + border already delivers the elevated feel. If a future token for theme-aware inset is added, it can be layered into `menuContent` without API churn.
- **Legacy `menuIndicator` export:** kept exported from `menu.css.ts` but unused internally, so any third-party import doesn't break. Can be deleted in a follow-up once consumer usage is confirmed to be zero.
