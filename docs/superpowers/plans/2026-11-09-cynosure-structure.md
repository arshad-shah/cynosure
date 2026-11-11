# Cynosure Milestone 2 Structure and Overlays Implementation Plan (Plan 3 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the structural and overlay components products need: Stack and Inline, Card, Toolbar, Tabs, Disclosure and Accordion, Popover, Menu, Dialog and Sheet, Toast, Notice, EmptyState and CopyButton. Then close Plan 2's carry-overs.

**Architecture:** Unchanged. A new foundation, `DialogBase`, is the only place `<dialog>` appears. Overlays reuse `src/overlay` (positioner, top layer). A shared `useDismiss` hook (Escape, outside pointer, focus return) and `useRovingFocus` hook (arrow-key roving tabindex) live in `src/overlay/` and `src/foundations/`, and are unit- and story-tested.

**Spec:** `docs/superpowers/specs/2026-11-09-cynosure-next-design.md` (§6.5, §6.6, §6.9, §8 Milestone 2). Conventions: `docs/conventions.md`.

## Global Constraints

- Everything in Plans 1 and 2 still holds: the prop vocabulary; behavioural tests on Chromium, Firefox, WebKit and touch; hostile host; `cy check` including `inherit-chain`; size budgets (≤ 3 kB JS + CSS gzip per component; Dialog, Menu and Toast ≤ 4 kB); docs and READMEs; no AI attribution.
- Overlays never write to `<html>`/`<body>` (no scroll-lock on `body`). Modal dialogs use the native top layer (`showModal`) and the `inert` backdrop that `<dialog>` provides. They restore focus to the trigger.
- Built-in strings are overridable via `labels` (e.g. Dialog "Close", Toast "Dismiss", CopyButton "Copy" / "Copied").

## Review Focus

1. **Nested overlays:** a Menu inside a Dialog, and a Tooltip inside a Popover. Escape closes only the topmost layer, and focus returns to the correct trigger at each level. (Tasks 6, 7, 8)
2. **Many toasts at once:** the queue caps visible toasts, older ones collapse, and timers pause on hover and focus. Screen readers announce each toast once. (Task 9)
3. **Tabs with dynamic or overflowing tabs:** tabs added or removed keep a valid selection, and narrow containers scroll the tab list without losing arrow navigation. (Task 4)
4. **Dialog on touch and small screens:** below the `sm` container width it becomes a bottom Sheet, the content scrolls inside it, and the on-screen keyboard does not hide the focused field. (Task 8)
5. **CopyButton without clipboard permission:** a permission or insecure-context failure shows an error state and an announced message, and never throws. (Task 11)

---

### Task 1: Stack, Inline and the roving-focus hook

- **Stack and Inline:** `<Stack gap align justify as>` and `<Inline gap align justify wrap as>`. Gaps use space tokens (`"1"`…`"10"`), and `as` takes neutral elements only.
- **Roving focus:** `useRovingFocus(container, { orientation, loop, rtl })` gives a roving tabindex with Home and End.
- **Tests:**
  - gaps map to tokens; `as` renders the element; RTL ordering
  - hook unit tests in jsdom: arrows, Home/End, loop, RTL, skipping disabled items

### Task 2: Card

- **Props:** `<Card variant ("surface" | "outline" | "soft") padding tone? interactive? as?>`.
- **Interactive cards:** use `ButtonBase` or `LinkBase` through `as`, with a focus ring and press scale.
- **Tests:**
  - a whole-card link is activatable by click and Enter, with no nested interactive warnings
  - hostile host

### Task 3: Toolbar

- **Props:** `<Toolbar label orientation>` with `role="toolbar"` and `useRovingFocus`, containing Buttons, IconButtons and SegmentedControls.
- **Tests:** one Tab stop; arrows move between items; Home/End; disabled items are skipped; touch.

### Task 4: Tabs

- **Components:** `<Tabs value defaultValue onChange activation ("auto" | "manual")>`, plus `<TabList label>`, `<Tab value icon? disabled?>` and `<TabPanel value>` (APG tabs).
- **Overflow:** the tab list scrolls horizontally when it overflows.
- **Tests:**
  - arrows, Home and End; manual activation needs Enter or Space
  - `aria-controls` and `aria-labelledby` are wired
  - dynamic removal of the selected tab picks the next one
  - an overflowing list scrolls the active tab into view; RTL

### Task 5: Disclosure and Accordion

- **Components:** `<Disclosure summary defaultOpen open onOpenChange>` and `<Accordion type ("single" | "multiple") collapsible>`. These replace native `<details>`.
- **Animation:** the height animates with `interpolate-size` / `::details-content`-style CSS, with a JS fallback.
- **Tests:** toggles with click, Enter and Space; `aria-expanded`/`aria-controls`; single mode closes the others; reduced motion; hostile host.

### Task 6: Popover and useDismiss

- **Hook:** `useDismiss({ open, onClose, refs })` handles Escape for the topmost layer only, outside pointer clicks, and focus return.
- **Component:** `<Popover trigger content placement modal? labels>` in the top layer, focusing its first element on open.
- **Tests:** nested popovers close one at a time; focus returns; outside click closes; it works in a shadow root; it flips at the edges.

### Task 7: Menu

- **Components:** `<Menu trigger items: { value, label, icon?, shortcut? (Kbd), disabled?, tone? }[] | sections onSelect>` (APG menu button).
- **Keyboard:** arrows, Home, End, typeahead; Escape and Tab close.
- **Variants:** checkable items (`menuitemcheckbox` / `menuitemradio`).
- **Tests:** keyboard paths; the select callback fires; focus returns; danger tone; a Menu inside a Dialog closes only itself; touch rows ≥ 44.

### Task 8: DialogBase, Dialog and Sheet

- **`DialogBase`:** the foundation wrapping `<dialog>` (`showModal`/`close` driven by the `open` prop; a `cancel` event becomes `onClose`).
- **`Dialog`:** `<Dialog open onOpenChange title description actions size dismissible labels>`. Focus goes into the dialog and returns afterwards; it has a close `IconButton`.
- **`Sheet`:** `<Sheet side ("bottom" | "end")>`. A Dialog becomes a bottom Sheet when its container is narrower than `sm` (container query).
- **Tests:**
  - focus is trapped (native) and returns
  - Escape closes unless `dismissible={false}`
  - clicking the backdrop closes
  - inner content scrolls
  - narrow width → sheet
  - nested Menu closes first
  - no writes to `body`
  - works in a shadow root

### Task 9: Toast

- **API:** `<Toaster position max>` plus a `toast({ title, description, tone, action?, duration })` store (no globals; created per Toaster via context).
- **Announcements:** `aria-live` polite, or assertive for danger.
- **Behaviour:** timers pause on hover and focus; on touch, a swipe dismisses.
- **Tests:**
  - shows and auto-dismisses; pause and resume
  - max visible, with older toasts collapsing
  - action button works
  - announced once
  - reduced motion
  - swipe (touch tag)

### Task 10: Notice and EmptyState

- **`Notice`:** `<Notice tone title action? dismissible? labels>`, inline, `role="status"` (or `alert` for danger).
- **`EmptyState`:** `<EmptyState icon title description actions>`.
- **Tests:** roles by tone; dismiss; tone contrast ≥ 4.5; layout at narrow widths.

### Task 11: CopyButton

- **Props:** `<CopyButton value labels={{ copy, copied, failed }} timeout>`, an IconButton that swaps the `copy` and `check` icons and announces the result.
- **Clipboard:** injectable through a `copy` prop (default `navigator.clipboard.writeText`) for extensions and tests.
- **Tests:** success state and announcement; failure (rejected or missing clipboard) shows the failed state without throwing; it reverts after the timeout.

### Task 12: Plan 2 carry-overs

- **React 18 smoke:** an isolated fixture under `tests/react18/` with its own `package.json` (React 18), installed in CI with `pnpm --dir tests/react18 install`, rendering Button, TextField and Select.
- **Dark-contrast visual baselines:** the visual hook re-renders with the contrast global through `CynosureTheme` props.

### Task 13: Docs, progress, migration issues readiness, push

- **Docs:** update README, Introduction, migration coverage and PROGRESS (Plan 3 done, Plan 4 next).
- **Gates:** `pnpm verify`; CI green; baselines; push.
