# src/overlay

Shared machinery for everything that floats: Tooltip, Select, Popover, Menu, Dialog and Sheet, Toast.

- `position.ts`: pure `computePosition` (preferred side, flip, shift, `align` centre, start, or flush (also level with the top for side placements: submenus), RTL). Unit-tested; keep it pure.
- `use-anchored-position.ts`: keeps a fixed, top-layer element next to its anchor on scroll and resize, and sets `data-placement`. Show the element (`showPopover`) **before** this runs, since it must be laid out to be measured.
- `dismiss.ts`: `useDismiss({ open, onClose, inside, returnFocus, outside })`. One layer stack for the whole page:
  - Escape closes only the topmost layer: the most recently opened one with no other open layer nested in it.
  - A component that handles Escape itself (an open Select list) calls `preventDefault`, and the stack leaves it alone.
  - A pointer down outside every `inside` element closes the layer (shadow DOM aware via `composedPath`).
  - `outside` can be a function instead (Dialog: "the pointer went down on the backdrop"); then the layer closes only if it is the topmost, so a backdrop click with a Menu open inside closes just the Menu. Listeners run in the order layers opened, so an outer layer decides before its nested ones close.
  - Focus returns to `returnFocus` only when it was inside the layer or lost to the body.

- `toast-host.ts`: `ToastHostContext`. An open Dialog (inside a Toaster) registers a container inside itself; the Toaster portals its region into the latest one, so toasts are above the modal and not inert. Kept separate so Dialog does not import Toast.

Rules: every overlay uses the top layer (the Popover API, `popover="manual"` spread as `{...{ popover: "manual" }}`; modal dialogs use `DialogBase`'s `showModal`) and `useDismiss`. Never write to `<html>` or `<body>`. Tests: `tests/unit/dismiss.test.tsx` plus the nested stories in Popover.
