# src/overlay

Shared machinery for everything that floats: Tooltip, Select, Popover, Menu, Dialog, Toast.

- `position.ts`: pure `computePosition` (preferred side, flip, shift, `align` start or centre, RTL). Unit-tested; keep it pure.
- `use-anchored-position.ts`: keeps a fixed, top-layer element next to its anchor on scroll and resize, and sets `data-placement`. Show the element (`showPopover`) **before** this runs, since it must be laid out to be measured.
- `dismiss.ts`: `useDismiss({ open, onClose, inside, returnFocus, outside })`. One layer stack for the whole page:
  - Escape closes only the topmost layer: the most recently opened one with no other open layer nested in it.
  - A component that handles Escape itself (an open Select list) calls `preventDefault`, and the stack leaves it alone.
  - A pointer down outside every `inside` element closes the layer (shadow DOM aware via `composedPath`).
  - Focus returns to `returnFocus` only when it was inside the layer or lost to the body.

Rules: every overlay uses the Popover API top layer (`popover="manual"`, spread as `{...{ popover: "manual" }}`) and `useDismiss`. Never write to `<html>` or `<body>`. Tests: `tests/unit/dismiss.test.tsx` plus the nested stories in Popover.
