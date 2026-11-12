# Container

The page column: it centres its content, caps how wide it gets and adds side gutters, so every page of an app lines up. Layout only: it has no background, border or text styles of its own.

```tsx
import { Container } from "@arshad-shah/cynosure";

<Container as="main">…</Container>                    // 1024px at most, 16px gutters, centred
<Container size="sm" paddingBlock="8">…</Container>   // a narrow reading column with space above and below
<Container size="full" padding="8">…</Container>      // no cap, wider gutters
```

| Prop                      | Default                        | Notes                                                                                                                           |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `size`                    | `lg`                           | `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 px at most, gutters included; `full` no cap                                         |
| `padding`                 | `--cy-container-padding` (`6`) | Space token for the side gutters; `"0"` removes them                                                                            |
| `paddingBlock`            | –                              | Space token for the top and bottom padding                                                                                      |
| `center`                  | `true`                         | `false` keeps the column at the inline start                                                                                    |
| `hideBelow` / `hideAbove` | –                              | Hidden while the window is narrower than / at least this breakpoint (`sm` 30rem, `md` 45rem, `lg` 60rem, `xl` 75rem). No script |
| `id`, `role`, `aria-*`    | –                              | Passed to the element: a link target, a named landmark or group                                                                 |
| `as`                      | `div`                          | `div` · `main` · `section` · `article`                                                                                          |
| `className` / `style`     | –                              | Layout only                                                                                                                     |
- **Width:** the column fills its parent up to the cap of its `size`, and is never wider than the parent. The cap includes the gutters, so the content is at most the cap less two gutters wide.
- **Gutters:** `padding` is a space token, so it follows the theme. Each gutter is at least the device's safe-area inset on that side (`env(safe-area-inset-left)` and `-right`), so content clears a phone's notch in landscape. The page needs `viewport-fit=cover` in its viewport meta tag for the browser to report insets.
- **Right to left:** the gutters are equal, so nothing changes; `center={false}` puts the column at the right edge.
- **Nesting:** a Container inside another gets its own default gutters and inherits none of its parent's padding.
- **With Grid:** a `Grid` with `columns` per breakpoint that fills a Container of a given size (default gutters, 16px root font size) reaches the breakpoint of the same name.
- **Accessibility:** `as="main"` makes it the page's main landmark; use it once per page. A `section` is only a landmark when it has an accessible name. Nothing in a Container is focusable or pressable.

## Tokens

- `--cy-container-size-sm`: widest a `size="sm"` container gets (default 640px)
- `--cy-container-size-md`: widest a `size="md"` container gets (default 768px)
- `--cy-container-size-lg`: widest a `size="lg"` container gets (default 1024px)
- `--cy-container-size-xl`: widest a `size="xl"` container gets (default 1280px)
- `--cy-container-padding`: side gutters when the `padding` prop is not set (default `--cy-space-6`)

Set them with `createTheme({ components: { container: { sizeLg: "1100px" } } })`.

## Used by

Planr (the page column of every screen inside AppShell's main area, replacing its `.planr-page` class) and the tools app (page width and gutters of each tool page).
