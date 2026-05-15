---
'@arshad-shah/cynosure-react': minor
---

**Drop 13 external dependencies by owning the primitives in-tree.** Removed: `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-direction`, `@radix-ui/react-avatar`, `@radix-ui/react-switch`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `@radix-ui/react-collapsible`, `@radix-ui/react-accordion`, `@radix-ui/react-tabs`, `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`. All public component APIs are preserved (`data-state="…"`, `aria-pressed`, controlled/uncontrolled `value`/`onValueChange`, etc.).

Each replacement is implemented as a small in-tree component that mirrors the Radix contract — same selection state shape, same `data-state` / `aria-*` attributes, same keyboard model (arrow-key roving tabindex, Home/End jumps, Space/Enter activation in the right contexts, RTL-aware horizontal navigation where applicable). Components that participate in HTML forms now render a hidden `<input>` alongside the visible button when a `name` prop is supplied, so existing forms keep submitting unchanged.

`--radix-collapsible-content-height` and `--radix-accordion-content-height` are still set on the content elements (alongside the new `--cynosure-…` mirror names) so any consumer CSS still reading the Radix variable names keeps animating correctly.
