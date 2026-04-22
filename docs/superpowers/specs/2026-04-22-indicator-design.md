# Indicator Component — Design Spec

Date: 2026-04-22
Status: Approved (brainstorm)
Owner: Arshad Shah
Scope: Add a new `Indicator` primitive in `packages/react/src/feedback/Indicator/` that positions the existing `<Badge>` onto the corner of an arbitrary child element (icon button, avatar, sidebar item, etc.).

## Goals

- Provide an overlay-badge wrapper for notification dots, unread counts, status markers, etc.
- Reuse the existing `<Badge>` primitive under the hood for all visual concerns (color scheme, variant, size, dot, icon). Zero duplication of styling knowledge.
- Keep the decorated child untouched — no ARIA pollution, no layout disruption.

## Non-goals

- Routing, animation, or motion — the indicator is static.
- Automatic content truncation (`content="99+"` is the consumer's call; we document the pattern in a story).
- Retrofitting `SidebarItem`'s badge rendering. Consumers can opt in by wrapping the icon in `<Indicator>`.

## API

```ts
interface IndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Content rendered inside the badge. Omit for dot mode. */
  content?: ReactNode;
  /** Render as a bare coloured dot (forwarded to Badge.dot). */
  dot?: boolean;
  /** Corner the badge hugs. Default 'top-end'. */
  placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  /** Inset offset in px. Positive moves badge further outside the child. Default 0. */
  offset?: number;
  /** Hide the badge entirely (keeps layout). Useful for count === 0. */
  invisible?: boolean;
  /** Predicate variant of `invisible`, evaluated against `content`. */
  hideOn?: (content: ReactNode) => boolean;
  /** Forwarded to the inner <Badge>. */
  colorScheme?: BadgeColorScheme;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  /** The element the indicator decorates. Exactly one React element. */
  children: ReactElement;
  /** Override screen-reader label. If omitted, falls back to string-coerced content. */
  'aria-label'?: string;
}
```

**Usage:**

```tsx
<Indicator content="3" colorScheme="danger">
  <SidebarItem icon={<InboxIcon />} label="Inbox" />
</Indicator>

<Indicator dot colorScheme="success">
  <Avatar src="..." />
</Indicator>

<Indicator content={count} hideOn={(v) => v === 0}>
  <IconButton icon={<BellIcon />} />
</Indicator>
```

## Behavior

### Wrapping

- Root element: `<span>` with `position: relative; display: inline-flex; vertical-align: middle`.
- Accepts exactly one React element child. More than one → `Children.only` throws a clear error.
- The child is rendered unchanged. No cloning, no prop forwarding onto it.

### Positioning

The badge is an absolutely positioned span inside the root. `placement` maps to these styles:

| placement | CSS |
|---|---|
| `top-end` (default) | `top: 0; inset-inline-end: 0; transform: translate(50%, -50%)` |
| `top-start` | `top: 0; inset-inline-start: 0; transform: translate(-50%, -50%)` |
| `bottom-end` | `bottom: 0; inset-inline-end: 0; transform: translate(50%, 50%)` |
| `bottom-start` | `bottom: 0; inset-inline-start: 0; transform: translate(-50%, 50%)` |

`offset` adjusts the translate values by that many pixels along both axes. Positive moves the badge further outside the child. Implemented via CSS variable on the badge wrapper, e.g. `style={{ '--indicator-offset': \`${offset}px\` }}`.

`placement` is also exposed as `data-placement="<value>"` on the badge wrapper for test assertions and consumer restyling.

### Visibility

- `invisible` prop → badge rendered with `visibility: hidden`. Box preserved so the decorated layout doesn't reflow when the badge appears/disappears.
- `hideOn(content)` → if the predicate returns `true` for the supplied `content`, treat as `invisible`. Evaluated in a single pass.

### Rendering the badge

The floating badge IS the existing `<Badge>`, with these props forwarded:
- `dot`, `colorScheme`, `variant`, `size`, `icon`, `content` (as children).

No extra styling is invented. If `Badge` adds a new variant tomorrow, `Indicator` consumers get it for free via prop pass-through.

### Accessibility

- If `dot` and no `aria-label` and no textual `content` → the wrapping span gets `aria-hidden="true"` (decorative).
- Else the wrapping span gets `role="status"` and `aria-label` = explicit prop, or string-coerced `content`, or unset (in which case `Badge`'s children provide the accessible name).
- The decorated child is untouched.

### Reduced motion

Nothing animates, so no special handling.

## Files

```
packages/react/src/feedback/Indicator/
  Indicator.tsx         (~60 lines)
  Indicator.css.ts      (~40 lines; positioning only)
  Indicator.stories.tsx
  index.ts              (barrel)
packages/react/src/feedback/__tests__/Indicator.test.tsx
packages/react/src/feedback/index.ts   (add Indicator export)
```

Top-level `packages/react/src/index.ts` already re-exports through `feedback/index.ts`, so no change there if the existing pattern is followed.

## Testing

Vitest + @testing-library/react, matching `feedback/__tests__/` conventions.

- **Single-child constraint:** rendering with zero or two children throws via `React.Children.only`. Assert using `expect(() => render(...)).toThrow()`.
- **Forwarding:** `colorScheme`, `variant`, `size`, `dot`, `icon` reach the inner Badge (assert by class presence or by `data-*` attributes the Badge already sets; fall back to snapshot of role/text if Badge exposes nothing queryable).
- **Placement:** `placement="bottom-start"` → badge wrapper has `data-placement="bottom-start"`.
- **Offset:** `offset={4}` sets the inline `--indicator-offset` CSS variable on the badge wrapper; assert via `getComputedStyle` or inline `style` attribute.
- **Invisible:** `invisible` → badge in DOM, `visibility: hidden`; the wrapper still takes layout space.
- **hideOn:** `<Indicator content={0} hideOn={(v) => v === 0}>` behaves as `invisible`.
- **Accessibility:**
  - `aria-label` prop overrides derived name.
  - Dot-only, no label → span has `aria-hidden="true"`.
  - Text content → span has `role="status"` and derived label.

## Stories

1. `Default` — count on an icon button.
2. `Dot` — bare dot on an avatar.
3. `Placements` — 2×2 grid covering all four corners.
4. `Offset` — same anchor with offsets `-4`, `0`, `4`, `8`.
5. `ColorSchemes` — neutral / info / success / warning / danger (whatever `Badge` supports).
6. `MaxCount` — consumer helper pattern: `content={count > 99 ? '99+' : count}`.
7. `InvisibleToggle` — counter drops to 0, `hideOn` hides the badge.
8. `OnSidebarItem` — real-world wrap around a `<SidebarItem>` in both expanded and collapsed rail.

## Breaking changes

None. Purely additive. Existing `<Badge>` API and existing `SidebarItem.badge` behavior are untouched.

## Out of scope

- Tooltip integration — consumers can wrap the whole Indicator in a `<Tooltip>` if needed.
- Animated mount/dismount — can be added later if needed.
- RTL-specific testing beyond what logical properties already give us.
