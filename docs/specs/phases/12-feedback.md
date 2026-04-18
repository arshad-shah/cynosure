# Phase 12 — Feedback

> **Goal:** The small components that communicate state, status, and identity — badges, tags, chips, avatars, alerts, banners, empty states, and callouts.

**Depends on:** Phases 01–11 (some compose Popover, Tooltip).
**Blocks:** Nothing.

---

## Components

1. **`Badge`**, **`Tag`**, **`Chip`**
2. **`Avatar`** + **`AvatarGroup`**
3. **`Alert`** + **`AlertTitle`** + **`AlertDescription`**
4. **`Banner`**
5. **`Notification`** (inline notification card)
6. **`Callout`**
7. **`EmptyState`**
8. **`Toggle`** + **`ToggleGroup`** (button-like toggles; not switches)

---

## `Badge`, `Tag`, `Chip` — the subtle distinction

Three components that look similar but serve different purposes. **Clarity matters.**

| Component | Purpose | Interactive? | Removable? |
|-----------|---------|--------------|------------|
| `Badge` | Label/count/status indicator next to something | No | No |
| `Tag` | Categorical label (blog categories, skills) | Optional | Optional |
| `Chip` | Interactive selectable item (filter chips, input tokens) | Yes | Yes |

Document this explicitly in the docs site — consumers WILL confuse them.

### `Badge`

```tsx
<Badge colorScheme="success" variant="soft" size="sm">New</Badge>
<Badge variant="solid">12</Badge>
<Badge dot />   {/* just a coloured dot for status */}
```

### Props
- `variant`: `solid` | `soft` (default) | `outline` | `ghost`
- `colorScheme`: `accent` | `neutral` | `success` | `warning` | `danger` | `info`
- `size`: `xs` | `sm` | `md`
- `shape`: `default` (rounded) | `pill` | `square`
- `dot`: boolean — renders a small dot only (no content)
- `icon`: `ReactNode` — leading icon

### Composition
`<Inline as="span" gap="1" …>`. Never a div; always inline-level for badge semantics.

---

### `Tag`

```tsx
<Tag>Product</Tag>
<Tag colorScheme="violet" onRemove={() => …}>JavaScript</Tag>
```

### Props
Same as Badge plus:
- `onRemove?: () => void` — adds an X icon; when present, Tag becomes focusable and Enter/Delete/Backspace triggers remove
- `onClick?` — makes the whole tag a button

When both are present, click on the tag body = `onClick`; click on X = `onRemove`; Enter = onClick; Backspace/Delete = onRemove.

### Accessibility
- When `onRemove` is set, tag is `role="group"` with an inner `<button aria-label="Remove {tag}">`.
- When `onClick` is set, whole tag is a `<button>`.
- With both: outer is a group, two buttons inside.

---

### `Chip`

Interactive by design. Used in filter bars and as `TagsInput` tokens.

```tsx
<Chip selected={isActive} onSelectedChange={setActive}>React</Chip>
```

### Props
- `selected`: boolean
- `onSelectedChange`: (v: boolean) => void
- `disabled`
- `size`, `colorScheme`, `variant` (like Badge)
- `leftIcon`, `rightIcon`
- `onRemove?` — same as Tag

Uses `<button role="button" aria-pressed={selected}>`.

---

## `Avatar`

```tsx
<Avatar src="/user.jpg" name="Arshad Shah" size="md" />
<Avatar name="A" fallback="AS" />                        {/* initials */}
<Avatar icon={<UserIcon />} />                           {/* fallback icon */}
```

### Props
- `src?: string` — image URL; falls back to initials or icon on load error
- `name?: string` — used to derive initials and `alt` text
- `alt?: string` — overrides auto alt
- `fallback?: string | ReactNode` — explicit fallback
- `icon?: ReactNode` — fallback icon
- `size`: `xs` (20px) | `sm` (24) | `md` (32) | `lg` (40) | `xl` (56) | `2xl` (72)
- `shape`: `circle` (default) | `square` | `rounded`
- `colorScheme?`: string — background colour for initials; auto-derived from name hash if not provided
- `status?: 'online' | 'offline' | 'away' | 'busy'` — adds status dot indicator
- `statusPosition?: 'top-right' | 'bottom-right'`
- `ring?: boolean` — adds a border ring (useful inside AvatarGroup)

### Strategy
Use `@radix-ui/react-avatar` for the src → fallback swap behaviour (it handles image load state correctly).

### Initial-colour generation
Deterministic from name hash:

```ts
function colorFromName(name: string): string {
  const palette = ['red', 'amber', 'green', 'blue', 'violet', 'pink', 'teal', 'orange'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}
```

Maps to our colour tokens. Same name → same colour, always.

---

## `AvatarGroup`

```tsx
<AvatarGroup max={3} size="md">
  <Avatar name="Arshad" src="…" />
  <Avatar name="Bob" src="…" />
  <Avatar name="Cara" src="…" />
  <Avatar name="Dan" src="…" />
  <Avatar name="Eli" src="…" />
</AvatarGroup>
```

Renders the first `max` avatars inline with negative margin overlap; extras collapse into a `+N` pseudo-avatar. Context provides `size` and `ring: true` to children.

---

## `Alert`

Static inline alert (not a toast).

```tsx
<Alert status="warning" variant="soft" closable onClose={() => …}>
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>Your workspace is approaching its storage limit.</AlertDescription>
</Alert>
```

### Props
- `status`: `info` (default) | `success` | `warning` | `danger`
- `variant`: `soft` | `solid` | `outline` | `ghost`
- `size`: `sm` | `md` | `lg`
- `icon?: ReactNode | false` — override default status icon; `false` hides it
- `closable?: boolean` — adds a close button
- `onClose?: () => void`

### A11y
- `role="alert"` for dynamic alerts (new alerts announce to screen readers).
- `role="status"` for persistent non-urgent alerts (less interruptive).
- Expose `role` as a prop with sensible default based on `status`.

### Composition
`<Inline align="start" gap="3" padding="…" …>`. Icon, content column (Stack of title+description), close button.

---

## `Banner`

Full-width variant of Alert, typically pinned to the top of a page.

```tsx
<Banner status="info" closable>
  <BannerContent>New version available.</BannerContent>
  <BannerActions>
    <Button size="sm" variant="ghost">Learn more</Button>
  </BannerActions>
</Banner>
```

### Key differences from Alert
- Full-width, rounded-0 by default (visually spans the viewport).
- Actions area for buttons/links.
- Persists dismissal state in localStorage if `dismissKey` prop is provided.

### Props
- All Alert props plus:
- `dismissKey?: string` — persists dismissal across sessions

---

## `Notification` (inline notification card)

Distinct from Toast. A more substantial inline card — used inside an activity panel or notifications list.

```tsx
<Notification
  icon={<BellIcon />}
  title="New comment"
  description="Arshad commented on your issue."
  timestamp="2 min ago"
  actions={<Button size="sm">View</Button>}
  unread
  onRead={() => …}
  onDismiss={() => …}
/>
```

Composes `Card variant="ghost"` under the hood. No raw HTML.

---

## `Callout`

```tsx
<Callout icon={<InfoIcon />} colorScheme="accent">
  <CalloutTitle>Pro tip</CalloutTitle>
  <CalloutContent>Use <Code>asChild</Code> to preserve event handlers.</CalloutContent>
</Callout>
```

A softer cousin of Alert — often used in documentation for tips, notes, and warnings. Visually distinct from Alert (less urgent feel, typically used in prose).

### Props
- `colorScheme`: `accent` | `neutral` | `success` | `warning` | `danger`
- `icon?: ReactNode | false`
- `variant`: `soft` (default) | `outline`

---

## `EmptyState`

For zero-data states in lists, tables, and search results.

```tsx
<EmptyState size="md">
  <EmptyStateIcon><InboxIcon /></EmptyStateIcon>
  <EmptyStateTitle>No messages</EmptyStateTitle>
  <EmptyStateDescription>
    Your inbox is empty. New messages will appear here.
  </EmptyStateDescription>
  <EmptyStateActions>
    <Button>Compose</Button>
  </EmptyStateActions>
</EmptyState>
```

### Props on `EmptyState`
- `size`: `sm` | `md` | `lg` | `xl`
- `variant`: `default` | `subtle`

### Composition
`<Stack align="center" gap="4" padding="…" …>` with constrained max-width (`60ch`).

---

## `Toggle` / `ToggleGroup`

Button-style toggle (not a `Switch`). For toolbar-like toggles — think bold/italic/underline buttons in a rich text editor.

```tsx
<ToggleGroup type="multiple" value={formats} onValueChange={setFormats}>
  <Toggle value="bold" aria-label="Bold"><BoldIcon /></Toggle>
  <Toggle value="italic" aria-label="Italic"><ItalicIcon /></Toggle>
  <Toggle value="underline" aria-label="Underline"><UnderlineIcon /></Toggle>
</ToggleGroup>
```

Or single:

```tsx
<ToggleGroup type="single" value={align} onValueChange={setAlign}>
  <Toggle value="left"><AlignLeftIcon /></Toggle>
  <Toggle value="center"><AlignCenterIcon /></Toggle>
  <Toggle value="right"><AlignRightIcon /></Toggle>
</ToggleGroup>
```

### Strategy
Use `@radix-ui/react-toggle` and `@radix-ui/react-toggle-group`. Re-skin.

### Props (`ToggleGroup`)
- `type`: `single` | `multiple`
- `value` / `onValueChange` (controlled) or `defaultValue` (uncontrolled)
- `orientation`: `horizontal` | `vertical`
- `size`, `variant` (match Button variants)
- `rovingFocus`: boolean (default true)

---

## Testing requirements

Per component:
- Stories: variants, sizes, all colourSchemes, states (default, hover, focus, disabled, loading where applicable).
- Interaction tests:
  - Tag `onRemove`: click X removes; Backspace removes when focused.
  - Avatar: fallback to initials on src load error; status dot renders correctly per quadrant.
  - AvatarGroup: collapses to +N at `max`.
  - Alert/Banner: close button fires onClose; Banner `dismissKey` persists.
  - Toggle: click toggles; keyboard space toggles.
  - ToggleGroup: single mode restricts to one active; multiple allows multi.
- A11y stories pass.

---

## Exit criteria

- [ ] All feedback components exist with per-component entry points.
- [ ] Avatar initial-colour hash is deterministic (unit-tested).
- [ ] Banner `dismissKey` persists (localStorage mocked in test).
- [ ] All components compose layout primitives + Radix bases; zero raw HTML.
- [ ] Bundle sanity: each individual component ≤ 3 KB gzipped unless using a Radix primitive that adds more.
- [ ] Changesets: `@lumen/react` minor "Feedback components".

## Decisions to log

- Three-way distinction (Badge/Tag/Chip). Named explicitly to avoid overloading a single "Tag" component with too many props.
- Alert's `role="alert"` vs `"status"` — document the choice so consumers pick the right semantic.
- Avatar colour-from-name hash uses a curated 8-colour palette. Consumers can override per-avatar.
