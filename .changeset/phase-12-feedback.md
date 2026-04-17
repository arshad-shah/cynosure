---
'@lumen/react': minor
---

Phase 12 — feedback components.

`@lumen/react` gains the "status and identity" surface: badges, tags, chips, avatars, alerts, banners, notifications, callouts, empty states, and button toggles.

- **Badge / Tag / Chip:** three lookalikes with explicit, non-overlapping roles. `Badge` is a non-interactive label (soft/solid/outline/ghost × accent/neutral/success/warning/danger/info, sizes xs/sm/md, shape default/pill/square, optional `icon`, and a bare `dot` mode). `Tag` is a categorical label — static by default, becomes a `<button>` when `onClick` is set, renders a `role="group"` wrapper with an inner remove button when `onRemove` is set (with Backspace/Delete keyboard removal on the focused tag). `Chip` is always an interactive toggle button with `aria-pressed`, a controlled `selected` + `onSelectedChange` contract, optional `leftIcon`/`rightIcon`, and an optional `onRemove` tail button.
- **Avatar + AvatarGroup:** Radix-backed `<RadixAvatar.Root>` with image → initials → icon fallback chain; six sizes (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`), three shapes (`circle`/`square`/`rounded`), a deterministic 8-colour palette hash (`colorFromName`) so the same display name always maps to the same tint, optional status dot (`online`/`offline`/`away`/`busy` × top-right/bottom-right), and an optional ring for stacked group layouts. `AvatarGroup` overlaps the first N children and collapses the rest into a `+N` tile, projecting `size` + `ring` through context.
- **Alert + AlertTitle + AlertDescription:** static inline alert with `status` (`info`/`success`/`warning`/`danger`), `variant` (`solid`/`soft`/`outline`/`ghost`), sizes `sm`/`md`/`lg`, configurable icon (custom node, `false` to hide, or default status icon), and optional `closable` + `onClose`. ARIA `role` defaults to `alert` for danger/warning and `status` for info/success; consumers can override.
- **Banner + BannerContent + BannerActions:** full-width variant of Alert, rounded-0 by default, with a dedicated actions slot. `dismissKey` persists dismissal in `localStorage` across sessions (`clearBannerDismissal(key)` exported as a test helper).
- **Notification:** inline notification card with `icon` / `title` / `description` / `timestamp` / `actions` slots, `unread` state (highlighted background + dot), and `onRead` / `onDismiss` callbacks — for activity panels and notifications lists (distinct from Phase 09's Toast).
- **Callout + CalloutTitle + CalloutContent:** softer status surface used inline in prose — `soft` / `outline` variants × `accent`/`neutral`/`success`/`warning`/`danger` colour schemes. Left-border accent stripe for visual distinction from Alert.
- **EmptyState + EmptyStateIcon + EmptyStateTitle + EmptyStateDescription + EmptyStateActions:** centred "zero data" composition with size scale `sm`/`md`/`lg`/`xl` and `default`/`subtle` variants. Max-width constrained to `60ch` for readable copy.
- **Toggle + ToggleGroup + ToggleGroupItem:** Radix `@radix-ui/react-toggle` and `@radix-ui/react-toggle-group` re-skin. `Toggle` reads size/variant from `ToggleContext` (so a whole group can be sized once). `ToggleGroup` supports `single`/`multiple` types, horizontal/vertical orientation, and an `attached` mode that collapses gaps into a single pill bar with shared borders.

Shared `feedback/shared/surface.css.ts` centralises the Alert / Banner / Notification / Callout background-border-foreground recipe across `soft` / `solid` / `outline` / `ghost` × `info` / `success` / `warning` / `danger`. Shared `feedback/shared/icons.tsx` ships the default status icon set + the reusable close glyph, so Alert / Banner / Notification render the same visual language without each importing a third-party icon package.

New direct dependencies: `@radix-ui/react-avatar`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`.

All components ship per-component tsup entries with Node10 sidecar shims (`@lumen/react/badge`, `/tag`, `/chip`, `/avatar`, `/avatar-group`, `/alert`, `/banner`, `/notification`, `/callout`, `/empty-state`, `/toggle`, `/toggle-group`, `/feedback`). 35 new unit tests (392/392 total pass).
