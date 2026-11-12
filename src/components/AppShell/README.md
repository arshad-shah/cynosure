# AppShell

The frame of an app: a top bar, the navigation beside the content, and `<main>`. When the shell is narrow, the navigation moves into a drawer (a start-side Sheet) opened from a menu button in the bar. Includes a skip link.

```tsx
import { AppShell, SideNav } from "@arshad-shah/cynosure";

<AppShell header={<Brand />} nav={<SideNav label="Main" items={items} current={route.id} />}>
  <Page />
</AppShell>;
```

| Prop                  | Default | Notes                                                                                             |
| --------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `header`              | –       | Top bar content (brand, search, account)                                                          |
| `nav`                 | –       | The navigation, usually a `SideNav`                                                               |
| `children`            | –       | The page, rendered in `<main>`                                                                    |
| `tabs`                | –       | A bottom tab bar when narrow: `<SideNav layout="bar">` with the main sections                     |
| `collapseBelow`       | `768`   | Shell width (px) below which the navigation moves into a drawer                                   |
| `onNarrowChange`      | –       | `(narrow)` each time the shell becomes narrow or wide again, for code outside the shell           |
| `labels`              | –       | `openNav` ("Open navigation"), `nav` ("Navigation", the drawer title), `skip` ("Skip to content") |
| `className` / `style` | –       | Layout only                                                                                       |
- Fills its container's height; the content and the navigation scroll on their own while the bar stays.
- Responds to its own width, not the window's, so it works in side panels and embedded views.
- In the drawer, choosing a link or item closes it (group toggles do not) and focus returns to the menu button.
- With `tabs`, a narrow shell also gets a tab bar along the bottom (clear of the home indicator); the drawer still holds the full navigation.
- The skip link appears on the first Tab and moves focus to `<main>` without changing the URL.

## Reading the narrow state

Do not repeat the breakpoint in your product. Anything rendered inside the shell (header, navigation, tabs, content) reads it with `useAppShell()`:

```tsx
import { useAppShell } from "@arshad-shah/cynosure";

function Toolbar() {
  const { narrow } = useAppShell();
  return narrow ? <CompactToolbar /> : <FullToolbar />;
}
```

- `narrow` is `true` while the shell's own width is below `collapseBelow`, the same test that moves the navigation into the drawer.
- It is `false` on the server and on the first client render, so server markup hydrates without a mismatch. The shell measures itself before the first paint and renders again if it is narrow.
- Outside an AppShell the hook does not throw. It returns `{ narrow: false }`.
- Code outside the shell uses `onNarrowChange`. It is called once per change. A shell that mounts narrow calls it with `true` right after mounting; a shell that mounts wide does not call it until it narrows.
- There is no hook for the drawer: the shell closes it itself when a link or button inside it is pressed.

## Padding and width of the page

`<main>` has no padding and no maximum width, so a page can run edge to edge (a map, a table, a canvas). For an ordinary page, wrap the content in `Container`, which pads it and caps its width:

```tsx
<AppShell header={<Brand />} nav={<SideNav label="Main" items={items} />}>
  <Container>
    <Page />
  </Container>
</AppShell>;
```

## Tokens

- `--cy-app-shell-nav-background`, `--cy-app-shell-header-background`
- `--cy-app-shell-border`: lines between the bar, navigation and content

## Used by

The layouts of the web apps and the extensions' full-page views (cross-product audit, 2026-11-10).
