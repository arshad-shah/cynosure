# Phase 06 — Typography

> **Goal:** Ship the text-rendering components. Every one of them uses `Box` or `Slot` under the hood — no raw HTML in component bodies.

**Depends on:** Phases 01–05.
**Blocks:** Nothing structural, but every phase from 07 onwards uses these.

---

## Components

1. **`Text`** — body text with size/weight/colour variants.
2. **`Heading`** — h1–h6 with visual-level decoupling.
3. **`Code`** — inline `<code>`.
4. **`Kbd`** — keyboard key display.
5. **`Link`** — visually styled anchor with external-link affordance.
6. **`Blockquote`** — semantic quote with visual treatment.
7. **`List`** — ordered, unordered, description (`<dl>`).

---

## `Text`

```tsx
<Text size="md" weight="regular" color="default" align="start" truncate>
  Hello world
</Text>
```

### Props

```ts
interface TextProps extends LayoutProps {
  size?: Responsive<'xs' | 'sm' | 'md' | 'lg' | 'xl'>;        // body.xs..body.xl tokens
  weight?: Responsive<'regular' | 'medium' | 'semibold' | 'bold'>;
  color?: Responsive<ColorToken>;                              // uses foreground tokens
  align?: Responsive<'start' | 'center' | 'end' | 'justify'>;
  variant?: 'body' | 'caption' | 'overline' | 'lead';
  truncate?: boolean | number;                                 // true = 1 line, n = n lines
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  decorationColor?: ColorToken;
  as?: 'span' | 'p' | 'div' | 'label' | 'strong' | 'em';
  asChild?: boolean;
}
```

### Composition rule

`Text` renders `<Box as={as ?? 'span'}>` internally. It does not reach for `<span>` or `<p>` directly — Box does. **This is the pattern for every non-primitive component:** compose primitives, never intrinsic elements.

### Truncate implementation
- `truncate={true}` → `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- `truncate={n}` where n > 1 → `display: -webkit-box; -webkit-line-clamp: n; -webkit-box-orient: vertical; overflow: hidden;`

---

## `Heading`

```tsx
<Heading level={1} size="2xl">Dashboard</Heading>
```

### Props

```ts
interface HeadingProps extends LayoutProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;           // renders h1..h6 (default 2)
  size?: Responsive<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'>;
  weight?: Responsive<'regular' | 'medium' | 'semibold' | 'bold'>;
  color?: Responsive<ColorToken>;
  align?: Responsive<'start' | 'center' | 'end'>;
  truncate?: boolean | number;
  asChild?: boolean;
}
```

Critical design: **decouple semantic level from visual size.** `<Heading level={1} size="md">` renders an `h1` (for accessibility / SEO / document outline) but styled as medium text. This is a mandatory pattern in a design system — designers care about visual hierarchy, screen readers and SEO care about semantics.

Renders `<Box as={\`h${level}\`}>` by default. Uses composite typography tokens — `var(--cynosure-font-heading-1-weight)`, etc.

---

## `Code`

Inline code snippet.

```tsx
<Text>Use <Code>pnpm install</Code> to install.</Text>
```

### Props

```ts
interface CodeProps extends LayoutProps {
  size?: Responsive<'sm' | 'md'>;
  variant?: 'inline' | 'block';             // block = <pre><code>, renders as a block
  colorScheme?: 'neutral' | 'accent' | 'success' | 'danger';
  asChild?: boolean;
}
```

For `variant="block"`, a proper `CodeBlock` with syntax highlighting comes in Phase 11.

---

## `Kbd`

```tsx
<Kbd>⌘K</Kbd> <Kbd>Enter</Kbd>
```

Styled as a faux keycap: subtle shadow, monospace, rounded, small. Renders `<kbd>` via Box.

```ts
interface KbdProps extends LayoutProps {
  size?: 'sm' | 'md' | 'lg';
}
```

---

## `Link`

```tsx
<Link href="/docs" external>Docs</Link>
```

### Props

```ts
interface LinkProps extends LayoutProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  variant?: 'default' | 'subtle' | 'emphasis';
  underline?: 'always' | 'hover' | 'none';
  external?: boolean;                   // adds rel="noopener noreferrer", target="_blank", and an icon
  disabled?: boolean;
  asChild?: boolean;                    // for wrapping Next/Remix Link etc.
}
```

`external` appends a small inlined arrow SVG after the text **unless the link's children include `VisuallyHidden` instructing otherwise** — keeps a11y for screen readers (icon is `aria-hidden`). The SVG is inlined rather than imported so the typography bundle stays free of a runtime icon dependency.

**asChild is the expected pattern** when consumers use framework-level routing:

```tsx
<Link asChild><NextLink href="/docs">Docs</NextLink></Link>
```

---

## `Blockquote`

```tsx
<Blockquote attribution="Tim Berners-Lee">
  The Web is more a social creation than a technical one.
</Blockquote>
```

```ts
interface BlockquoteProps extends LayoutProps {
  attribution?: React.ReactNode;
  variant?: 'default' | 'callout';
  asChild?: boolean;
}
```

Renders `<Box as="blockquote">` with a `<cite>` child (via Box) when attribution is passed.

---

## `List`

Three variants under one API — or three components? Decision: **three components** (`List`, `OrderedList`, `DescriptionList`) that share a common base. Composability is clearer than a `variant` prop that swaps the rendered element.

### `List` (unordered)

```tsx
<List spacing="2" marker="disc">
  <ListItem>One</ListItem>
  <ListItem>Two</ListItem>
</List>
```

### `OrderedList`

```tsx
<OrderedList start={3} reversed>
  <ListItem>Third</ListItem>
  <ListItem>Second</ListItem>
  <ListItem>First</ListItem>
</OrderedList>
```

### `DescriptionList`

```tsx
<DescriptionList>
  <DescriptionTerm>Cost</DescriptionTerm>
  <DescriptionDetails>$10</DescriptionDetails>
  <DescriptionTerm>Colour</DescriptionTerm>
  <DescriptionDetails>Blue</DescriptionDetails>
</DescriptionList>
```

### Props (shared)

```ts
interface ListBaseProps extends LayoutProps {
  spacing?: Responsive<SpaceToken>;
  marker?: 'disc' | 'circle' | 'square' | 'none' | 'decimal' | 'lower-alpha' | 'upper-alpha';
  markerColor?: ColorToken;
  asChild?: boolean;
}
```

`ListItem` renders a `<li>` via `Box as="li"`. Similar for `DescriptionTerm` (`dt`) and `DescriptionDetails` (`dd`).

---

## Visual recipe

All typographic components share a single recipe file for common styles (colour, alignment, truncation) to avoid duplicating CSS:

```ts
// typography/shared.css.ts
export const alignClass = {
  start: style({ textAlign: 'start' }),
  center: style({ textAlign: 'center' }),
  end: style({ textAlign: 'end' }),
  justify: style({ textAlign: 'justify' }),
};
```

Small shared recipes > giant per-component recipes with duplicated values.

---

## Testing requirements

Every component:
- Stories: default, all sizes, all weights, all colours, truncation, RTL, with `asChild`.
- A11y stories pass on all variants.
- Unit tests: renders the correct element per `level` (Heading) or `as` (Text), prop → token mapping works, `truncate={3}` applies line clamp.
- Composition test: `Text` composed inside `Heading asChild` resolves correctly.

Edge cases to explicitly test:
- `Heading level={1} size="xs"` — h1 with tiny visual size.
- `Link external` on a link with only an icon child — screen-reader text required.
- `List as="ol"` — does not work; fail fast with a dev warning.

---

## Exit criteria

- [ ] All typography components exist with the file structure from Phase 05.
- [ ] None of them contains a raw JSX element other than `<Box>`, `<Slot>`, or other Cynosure primitives.
- [ ] Heading level/size decoupling works and is tested.
- [ ] `Link external` renders the correct icon + `rel` attributes.
- [ ] Typography composite tokens are used (no duplicated font sizes in component CSS).
- [ ] Per-component entry points added to tsup config and `exports` map.
- [ ] Bundle: `import { Text } from '@arshad-shah/cynosure-react/text'` produces ≤ 2 KB gzipped total (component + shared CSS).
- [ ] Changesets: `@arshad-shah/cynosure-react` minor "Typography components".

## Decisions to log

- Three list components vs one with variants. **Decision: three components.**
- Heading default level. **Decision: 2** (h2 is the most common semantically; h1 is often page-level and should be opt-in).
