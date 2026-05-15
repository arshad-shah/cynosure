import { Command as CommandPrimitive } from 'cmdk';
import { Loader2, Search } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { Kbd } from '../../typography/Kbd/Kbd.js';
import { cn } from '../../utils/cn.js';
import {
  Dialog as CynDialog,
  DialogContent as CynDialogContent,
  DialogTitle as CynDialogTitle,
  DialogTrigger as CynDialogTrigger,
} from '../Dialog/Dialog.js';
import {
  paletteContent,
  paletteEmpty,
  paletteFooter,
  paletteFooterHint,
  paletteFooterHints,
  paletteGroup,
  paletteInput,
  paletteInputIcon,
  paletteInputRow,
  paletteItem,
  paletteItemBody,
  paletteItemDescription,
  paletteItemIcon,
  paletteItemLabel,
  paletteItemShortcut,
  paletteKbdHint,
  paletteList,
  paletteLoading,
  paletteSeparator,
} from './CommandPalette.css.js';
// Unused named imports removed — CommandPalette heading is styled by the
// `[cmdk-group-heading]` selector inside `paletteGroup`.

/**
 * `CommandPalette` is a ⌘K search surface. Compose it with the `Item`,
 * `Group`, `Input`, `List`, `Empty`, and `Footer` subcomponents, or drop in
 * the pre-wired `CommandMenu` shortcut for the common case.
 *
 * Powered by `cmdk` — typing filters items in O(n) across their label +
 * `keywords` array. Selection is keyboard-first: ↑↓ to move, ↵ to run.
 */
export const CommandPalette = CommandPrimitive as typeof CommandPrimitive & {
  displayName?: string;
};
CommandPalette.displayName = 'CommandPalette';

/**
 * Props for the palette root. Forwards every prop accepted by `cmdk`'s
 * `Command` (controlled value, `shouldFilter`, `label`, `loop`, etc.).
 */
export type CommandPaletteProps = ComponentPropsWithoutRef<typeof CommandPrimitive>;

/**
 * Props for the palette's search input row — owns the leading icon and the
 * trailing kbd hint chip in addition to the underlying cmdk input.
 */
export interface CommandInputProps
  extends Omit<ComponentPropsWithoutRef<typeof CommandPrimitive.Input>, 'value'> {
  /** Controlled search value. */
  value?: string;
  /**
   * Leading icon slot. Falls back to a Lucide search glyph; pass any
   * `ReactNode` to swap it.
   */
  leading?: ReactNode;
  /**
   * Right-hand chip. Defaults to the `"Esc"` keyboard hint; pass `null` to
   * hide the chip entirely.
   * @default "Esc"
   */
  hint?: ReactNode;
}

/** The search input bar at the top of the palette. */
export const CommandInput = forwardRef<
  ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(function CommandInput({ className, leading, hint = 'Esc', ...rest }, ref) {
  return (
    <div className={paletteInputRow}>
      <span className={paletteInputIcon} aria-hidden>
        {leading ?? <Search size={16} strokeWidth={2} />}
      </span>
      <CommandPrimitive.Input
        ref={ref}
        className={cn(paletteInput, className)}
        placeholder="Type a command or search…"
        {...rest}
      />
      {hint != null ? (
        <span className={paletteKbdHint} aria-hidden>
          {hint}
        </span>
      ) : null}
    </div>
  );
});

/** Scrollable list body. Wraps `cmdk.List` so your content can be grouped or flat. */
export const CommandList = forwardRef<
  ElementRef<typeof CommandPrimitive.List>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({ className, ...rest }, ref) {
  return <CommandPrimitive.List ref={ref} className={cn(paletteList, className)} {...rest} />;
});

/** Rendered when no item matches the current search. */
export const CommandEmpty = forwardRef<
  ElementRef<typeof CommandPrimitive.Empty>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty({ className, children = 'No results found.', ...rest }, ref) {
  return (
    <CommandPrimitive.Empty ref={ref} className={cn(paletteEmpty, className)} {...rest}>
      {children}
    </CommandPrimitive.Empty>
  );
});

/**
 * Props for the in-list loading row shown while async results are being
 * fetched (typically paired with `shouldFilter={false}` on the palette).
 */
export interface CommandLoadingProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.Loading> {
  /**
   * Visible text shown next to the spinner. Doubles as the `aria-label`
   * when no explicit `label` prop is passed.
   * @default "Loading…"
   */
  text?: ReactNode;
}

/** Progress row shown while `CommandPalette` has `shouldFilter={false}` and is fetching. */
export const CommandLoading = forwardRef<
  ElementRef<typeof CommandPrimitive.Loading>,
  CommandLoadingProps
>(function CommandLoading({ className, text = 'Loading…', label, ...rest }, ref) {
  return (
    <CommandPrimitive.Loading
      ref={ref}
      className={cn(paletteLoading, className)}
      label={label ?? (typeof text === 'string' ? text : 'Loading')}
      {...rest}
    >
      <Loader2
        size={14}
        strokeWidth={2.25}
        aria-hidden
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <span>{text}</span>
    </CommandPrimitive.Loading>
  );
});

/** Named group of items, e.g. "Navigation", "Actions". */
export const CommandGroup = forwardRef<
  ElementRef<typeof CommandPrimitive.Group>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function CommandGroup({ className, ...rest }, ref) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(paletteGroup, className)}
      // Apply heading class via inline CSS so heading slot is styled even if
      // consumers pass their own className. cmdk renders `[cmdk-group-heading]`.
      {...rest}
    />
  );
});

/** Thin rule between groups of items. */
export const CommandSeparator = forwardRef<
  ElementRef<typeof CommandPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(function CommandSeparator({ className, ...rest }, ref) {
  return (
    <CommandPrimitive.Separator ref={ref} className={cn(paletteSeparator, className)} {...rest} />
  );
});

/**
 * Props for a selectable palette row. Forwards `value`, `keywords`,
 * `disabled`, and `onSelect` to the underlying cmdk item.
 */
export interface CommandItemProps extends ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  /** Leading icon slot. Optional — pass a Lucide icon or any node. */
  icon?: ReactNode;
  /** Subtext shown beneath the label. Optional. */
  description?: ReactNode;
  /**
   * Right-aligned shortcut affordance. Accepts a string like `"⌘K"` /
   * `"Ctrl+Shift+P"` (split into `<Kbd>` chips) or arbitrary JSX.
   */
  shortcut?: ReactNode;
}

/**
 * A single selectable row in the palette. cmdk handles filtering + focus;
 * you wire behaviour via `onSelect`.
 */
export const CommandItem = forwardRef<ElementRef<typeof CommandPrimitive.Item>, CommandItemProps>(
  function CommandItem({ className, icon, description, shortcut, children, ...rest }, ref) {
    return (
      <CommandPrimitive.Item ref={ref} className={cn(paletteItem, className)} {...rest}>
        {icon ? (
          <span className={paletteItemIcon} aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className={paletteItemBody}>
          <span className={paletteItemLabel}>{children}</span>
          {description ? <span className={paletteItemDescription}>{description}</span> : null}
        </span>
        {shortcut ? (
          <span className={paletteItemShortcut}>
            {typeof shortcut === 'string' ? (
              <CommandShortcut>{shortcut}</CommandShortcut>
            ) : (
              shortcut
            )}
          </span>
        ) : null}
      </CommandPrimitive.Item>
    );
  },
);

/**
 * Props for the kbd-chip renderer used inside `CommandItem.shortcut` (and
 * usable standalone).
 */
export interface CommandShortcutProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Pass a string like `"⌘K"` or `"Ctrl+Shift+P"` — split on `+` / whitespace
   * and rendered as a series of `<Kbd>` chips. JSX children are rendered
   * untouched.
   */
  children?: ReactNode;
}

/**
 * Kbd-chip renderer. Splits a string on `+` / spaces, or renders children
 * untouched if you pass your own JSX.
 */
export function CommandShortcut({ children, className, ...rest }: CommandShortcutProps) {
  if (typeof children !== 'string') {
    return (
      <span className={cn(paletteItemShortcut, className)} {...rest}>
        {children}
      </span>
    );
  }
  // Split on any run of whitespace and/or `+` characters. A single character
  // class with `+` quantifier is linear-time, avoiding the polynomial
  // back-tracking of the previous `\s*\+\s*|\s+` alternation (CodeQL #260).
  const keys = children.split(/[\s+]+/).filter(Boolean);
  // Duplicate keys (e.g. "⌘ ⌘") are exceedingly rare in real shortcuts; track
  // occurrences so we can build a stable key without leaning on index position.
  const seen = new Map<string, number>();
  return (
    <span className={cn(paletteItemShortcut, className)} {...rest}>
      {keys.map((k) => {
        const n = seen.get(k) ?? 0;
        seen.set(k, n + 1);
        return (
          <Kbd key={n === 0 ? k : `${k}#${n}`} size="sm">
            {k}
          </Kbd>
        );
      })}
    </span>
  );
}

/**
 * Props for the sticky footer hint row. Inherits all standard `<div>`
 * attributes; pass `children` to replace the default `↵ / ↑↓ / Esc` hints.
 */
export interface CommandFooterProps extends HTMLAttributes<HTMLDivElement> {}

/** Sticky bottom hints row — the `↵ select` / `Esc close` affordances. */
export function CommandFooter({ className, children, ...rest }: CommandFooterProps) {
  return (
    <div className={cn(paletteFooter, className)} {...rest}>
      {children ?? (
        <>
          <span className={paletteFooterHints}>
            <span className={paletteFooterHint}>
              <Kbd size="sm">↵</Kbd> select
            </span>
            <span className={paletteFooterHint}>
              <Kbd size="sm">↑</Kbd>
              <Kbd size="sm">↓</Kbd> navigate
            </span>
          </span>
          <span className={paletteFooterHint}>
            <Kbd size="sm">Esc</Kbd> close
          </span>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialog-hosted shortcut — the common case                           */
/* ------------------------------------------------------------------ */

/**
 * Props for the pre-wired `CommandMenu` — a Radix Dialog hosting a
 * `CommandPalette`, opened by ⌘K / Ctrl+K when uncontrolled.
 */
export interface CommandMenuProps extends CommandPaletteProps {
  /**
   * Controlled open state. Pair with `onOpenChange` for controlled mode;
   * omit for uncontrolled (toggled by ⌘K / Ctrl+K).
   */
  open?: boolean;
  /** Change handler for the dialog open state. */
  onOpenChange?: (open: boolean) => void;
  /** Optional trigger element — e.g. a button that opens the palette. */
  trigger?: ReactNode;
  /** Portal target. Forwarded to Radix's `Portal`. */
  container?: HTMLElement | (() => HTMLElement);
  /**
   * Accessible label for the dialog and the underlying cmdk palette.
   * Announced by screen readers when the palette opens.
   * @default "Command menu"
   */
  label?: string;
}

/**
 * `CommandMenu` is the pre-wired dialog + palette combo you probably want.
 * Opens on ⌘K (or ⌃K on Windows) when uncontrolled.
 */
export function CommandMenu({
  open,
  onOpenChange,
  trigger,
  container,
  label = 'Command menu',
  children,
  ...paletteProps
}: CommandMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const effectiveOpen = isControlled ? open : internalOpen;
  const setOpen = (next: boolean): void => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const isK = event.key === 'k' || event.key === 'K';
      if (isK && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!effectiveOpen);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // `setOpen` is recreated every render but closes over stable refs; we only
    // need to re-subscribe when the toggle target changes.
  }, [effectiveOpen]);

  const resolvedContainer = typeof container === 'function' ? container() : container;

  return (
    <CynDialog open={effectiveOpen} onOpenChange={setOpen}>
      {trigger ? <CynDialogTrigger asChild>{trigger}</CynDialogTrigger> : null}
      <CynDialogContent
        container={resolvedContainer}
        className={paletteContent}
        showCloseButton={false}
        aria-label={label}
      >
        <CynDialogTitle className="sr-only" style={srOnly}>
          {label}
        </CynDialogTitle>
        <CommandPalette label={label} {...paletteProps}>
          {children}
        </CommandPalette>
      </CynDialogContent>
    </CynDialog>
  );
}

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};
