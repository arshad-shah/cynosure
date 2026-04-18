# Phase 09 — Overlays

> **Goal:** Ship every floating/portal'd component. Focus management, scroll-lock, escape handling, and portal mounting are the recurring themes — solve them once, reuse everywhere.

**Depends on:** Phases 01–07.
**Blocks:** Phase 10 (Menu uses Popover), Phase 11 (DataTable uses Popover for filters).

---

## Components

1. **`Dialog`** / **`AlertDialog`**
2. **`Drawer`** / **`Sheet`** (same component, different directions)
3. **`Popover`** / **`HoverCard`**
4. **`Tooltip`**
5. **`Toast`** + **`toaster` API** + **`Toaster`** component
6. **`DropdownMenu`** / **`ContextMenu`** / **`MenuBar`**
7. **`Modal`** (alias for Dialog in some design languages — ship as a thin wrapper)

---

## Strategy

**Radix Primitives is the base for every overlay in this phase.** Not React Aria — Radix's overlay primitives (Dialog, Popover, Tooltip, DropdownMenu, ContextMenu, HoverCard) are extraordinarily well-tuned for the exact set of interactions we need and are the lightest well-behaved option on npm.

```bash
pnpm --filter @lumen/react add \
  @radix-ui/react-dialog \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-popover \
  @radix-ui/react-tooltip \
  @radix-ui/react-hover-card \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-context-menu \
  @radix-ui/react-menubar \
  sonner
```

`sonner` is the Toast library — small (~5 KB), ergonomic, animated, accessible. We re-skin its `Toaster` with our tokens.

---

## Shared overlay concerns — codify once

Create `packages/react/src/overlay/shared/` with:

- **`overlay.css.ts`** — animation keyframes, shared z-index tokens, backdrop styles
- **`useOverlayMount.ts`** — hook that handles mount/unmount animation sync (uses Radix's `Presence` internally)
- **`OverlayPortal.tsx`** — thin wrapper around Lumen's Portal adding a default `id="lumen-portal"` container
- **`ScrollLock.ts`** — body scroll lock utility (Radix's Dialog does this; export it so Drawer reuses)

All animations use tokens: `var(--lumen-duration-motion-short)` for enter/exit, `var(--lumen-easing-ease-out)` for timing. Reduced motion automatically zeroes durations via the Phase 03 media query.

---

## `Dialog`

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent size="md">
    <DialogHeader>
      <DialogTitle>Delete workspace</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <Stack gap="3">…</Stack>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button colorScheme="danger">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Parts

- `Dialog` (root — context provider, manages open state)
- `DialogTrigger` (`asChild` by default)
- `DialogContent` — portal'd, backdrop'd, focus-trapped
- `DialogHeader`, `DialogFooter` — layout slots (compose `Stack` and `Inline`)
- `DialogTitle`, `DialogDescription` — semantic titles (compose `Heading` and `Text`)
- `DialogClose` — any button that closes (`asChild` pattern)

### Props on `DialogContent`

```ts
interface DialogContentProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top';             // top is better for mobile
  closeOnOverlayClick?: boolean;           // default true
  closeOnEscape?: boolean;                 // default true
  showCloseButton?: boolean;               // default true — renders an X top-right
  initialFocusRef?: React.RefObject<HTMLElement>;
  restoreFocusRef?: React.RefObject<HTMLElement>;  // where to return focus on close
  container?: HTMLElement | (() => HTMLElement);   // custom portal target
}
```

### Under the hood

`DialogContent` composes:

```tsx
<DialogPortal container={container}>
  <DialogOverlay className={overlay({...})} />
  <RadixDialog.Content
    className={content({ size, position })}
    onEscapeKeyDown={!closeOnEscape ? (e) => e.preventDefault() : undefined}
    onInteractOutside={!closeOnOverlayClick ? (e) => e.preventDefault() : undefined}
  >
    {children}
    {showCloseButton && (
      <IconButton
        icon={<XIcon />}
        label="Close"
        onClick={() => context.setOpen(false)}
        className={styles.closeButton}
      />
    )}
  </RadixDialog.Content>
</DialogPortal>
```

### Behaviours inherited from Radix (don't reimplement)
- Focus trap inside content.
- Initial focus: first focusable descendant unless `initialFocusRef` provided.
- Return focus to trigger on close.
- `Esc` closes.
- Click outside closes.
- Body scroll lock.
- `aria-modal="true"`, `role="dialog"`, `aria-labelledby`/`aria-describedby` wired via `DialogTitle`/`DialogDescription` IDs.

---

## `AlertDialog`

Same as Dialog but:
- Cannot be dismissed by clicking outside or pressing Escape (enforced).
- Requires explicit `AlertDialogAction` and `AlertDialogCancel` buttons.
- Uses `role="alertdialog"`.

Back it with `@radix-ui/react-alert-dialog`. Thin wrapper, same style contract as Dialog.

---

## `Drawer` / `Sheet`

Edge-anchored overlay. Same primitive, different props.

```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerTrigger asChild><IconButton icon={<MenuIcon />} label="Menu" /></DrawerTrigger>
  <DrawerContent side="right" size="md">
    …
  </DrawerContent>
</Drawer>
```

### Props on `DrawerContent`

- `side?: 'top' | 'right' | 'bottom' | 'left'` (default `right`)
- `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` — width for left/right, height for top/bottom

### Implementation
Built on `@radix-ui/react-dialog` (Radix's Dialog is general-purpose enough). Different animation and positioning via vanilla-extract recipe.

### Swipe-to-dismiss (mobile)
Optional: detect pointer drag on mobile and close when exceeds threshold. Use the `@use-gesture/react` library **only if** we're willing to add 6 KB gz — otherwise skip this until a consumer asks. Default to no swipe; document as a follow-up.

`Sheet` is an alias export: `export { Drawer as Sheet, DrawerContent as SheetContent, … }`. Ship both names; same component.

---

## `Popover`

```tsx
<Popover>
  <PopoverTrigger asChild><Button>Settings</Button></PopoverTrigger>
  <PopoverContent align="start" side="bottom" sideOffset={8}>
    …
  </PopoverContent>
</Popover>
```

Backed by `@radix-ui/react-popover`. Features:
- Collision detection — flips when it'd overflow viewport.
- `align` (`start` | `center` | `end`) and `side` (`top` | `right` | `bottom` | `left`).
- `sideOffset`, `alignOffset`.
- Arrow: `<PopoverArrow />` renders a small caret.
- Modal-ish behaviour: click outside closes, Escape closes, focus returns to trigger.

---

## `HoverCard`

Hover-triggered popover for contextual info (user profile on username hover, preview on link hover).

```tsx
<HoverCard openDelay={300} closeDelay={100}>
  <HoverCardTrigger asChild><Link>@arshad</Link></HoverCardTrigger>
  <HoverCardContent>
    …avatar + bio…
  </HoverCardContent>
</HoverCard>
```

Backed by `@radix-ui/react-hover-card`. Not shown on touch devices (handled by Radix via media query internally).

---

## `Tooltip`

```tsx
<Tooltip content="Duplicate">
  <IconButton icon={<CopyIcon />} label="Duplicate" />
</Tooltip>
```

### Design decision
Tooltip accepts a single child (the trigger) and a `content` prop — simpler API than the Radix compound pattern. Under the hood:

```tsx
<TooltipPrimitive.Root delayDuration={delayMs}>
  <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content side={side} sideOffset={sideOffset} className={content({...})}>
      {contentProp}
      <TooltipPrimitive.Arrow className={arrow} />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
</TooltipPrimitive.Root>
```

### Props

```ts
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;               // the trigger
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  delayMs?: number;                           // default 300
  disabled?: boolean;
}
```

### Critical rule

**Tooltips are not replacements for accessible labels.** If a button is icon-only, use `IconButton label="…"`. Tooltip is for secondary, non-essential context. Document this prominently.

### `TooltipProvider`

Radix requires a `TooltipProvider` ancestor. Export `TooltipProvider` from `@lumen/react` and add a note: place once at app root for shared delay/skipDelay behaviour.

---

## `Toast` + `toaster` API

Use **sonner**. Wrap it minimally.

```tsx
// App root
<Toaster position="bottom-right" theme="system" />

// Anywhere
import { toast } from '@lumen/react';
toast.success('Saved');
toast.error('Failed to save', { description: 'Network error.' });
toast.promise(savePromise, {
  loading: 'Saving…',
  success: 'Saved',
  error: 'Failed',
});
```

### Customisation
Our `Toaster` component passes our token-derived `toastOptions` to sonner:

```tsx
<SonnerToaster
  position={position}
  theme={theme}
  toastOptions={{
    classNames: {
      toast: toastStyles.base,
      title: toastStyles.title,
      description: toastStyles.description,
      actionButton: toastStyles.actionButton,
      cancelButton: toastStyles.cancelButton,
      success: toastStyles.success,
      error: toastStyles.error,
      warning: toastStyles.warning,
      info: toastStyles.info,
    },
  }}
/>
```

### Re-export the `toast` function

```ts
// packages/react/src/overlay/Toast/index.ts
export { toast } from 'sonner';
export { Toaster } from './Toaster';
```

---

## `DropdownMenu`

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild><IconButton icon={<MoreIcon />} label="Actions" /></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => …}>Edit</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => …}>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Copy link</DropdownMenuItem>
        <DropdownMenuItem>Email</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem checked={star} onCheckedChange={setStar}>Star</DropdownMenuCheckboxItem>
    <DropdownMenuRadioGroup value={view} onValueChange={setView}>
      <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

Backed by `@radix-ui/react-dropdown-menu`. Re-export the full primitive set with our styling.

### Item props to wire through
- `disabled`
- `onSelect` (not `onClick` — Radix's contract; the menu closes automatically unless `e.preventDefault()`)
- `textValue` (for typeahead)
- `inset` (adds left padding to align with items that have a checkmark/icon slot)

---

## `ContextMenu`

Identical to DropdownMenu but triggered by right-click.

```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    <Box padding="4">Right-click me</Box>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Copy</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

Backed by `@radix-ui/react-context-menu`. Re-skin using the same CSS recipe as DropdownMenu (shared `menu.css.ts` file).

---

## `MenuBar`

Application-style menubar (think: Files | Edit | View in a web IDE).

```tsx
<MenuBar>
  <MenuBarMenu>
    <MenuBarTrigger>File</MenuBarTrigger>
    <MenuBarContent>
      <MenuBarItem>New</MenuBarItem>
      <MenuBarItem>Open…</MenuBarItem>
    </MenuBarContent>
  </MenuBarMenu>
  <MenuBarMenu>
    <MenuBarTrigger>Edit</MenuBarTrigger>
    <MenuBarContent>…</MenuBarContent>
  </MenuBarMenu>
</MenuBar>
```

Backed by `@radix-ui/react-menubar`. Keyboard: arrow left/right moves between top-level menus; arrow down opens.

---

## `Modal`

Not a new component — a thin alias of `Dialog` with `position="center"` and some opinionated defaults. Some consumers prefer the word "Modal"; we export both names.

```ts
export { Dialog as Modal, DialogContent as ModalContent, … } from '../Dialog';
```

---

## Testing requirements

Per overlay component:

- Stories: default, each size, each side/align (for positioned overlays), controlled mode.
- Interaction tests:
  - Dialog: trigger click opens; focus moves into content; Esc closes; tab wraps within trap; focus returns to trigger on close.
  - Popover: trigger opens; click outside closes; arrow collision-aware positioning.
  - Tooltip: hover opens after delay; focus opens; blur closes; Escape closes.
  - DropdownMenu: open → typeahead → Enter → closes; arrow keys navigate; left/right navigate sub-menus.
- A11y stories: all must pass. Dialog/AlertDialog have dedicated stories asserting `aria-modal`, `aria-labelledby`, `aria-describedby` are correct.
- Test `disableTransitionOnChange`-style animations respect `prefers-reduced-motion`.

---

## Exit criteria

- [ ] All overlay components exist with per-component entry points.
- [ ] Every overlay animates with our motion tokens; reduced-motion kills animation.
- [ ] Focus management verified by play functions (Tab cycles, Esc closes, focus returns).
- [ ] `sonner` integration: `toast.success/error/warning/info/promise` all work and are styled.
- [ ] Portal target: all overlays portal into `<body>` by default but accept custom `container`.
- [ ] Bundle: `import { Dialog }` ≤ 12 KB gzipped (Radix Dialog + our wrapper + CSS).
- [ ] RTL: all overlays position and flip correctly in `<DirectionProvider dir="rtl">`.
- [ ] Changesets: `@lumen/react` minor "Overlay components".

## Decisions to log

- Radix over React Aria for overlays. Radix has better defaults for the exact patterns we need (Dialog/Popover/Menu/Tooltip), smaller bundle per primitive, and is less opinionated about rendering structure.
- `sonner` for Toast vs rolling our own. sonner is ~5 KB, battle-tested, and the ergonomics (`toast()` as a function call from anywhere) are hard to beat. Re-skin, don't reinvent.
- `Modal` as an alias. Some consumers prefer the name; aliasing is free.
