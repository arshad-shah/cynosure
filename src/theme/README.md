# CynosureTheme and useColorMode

Applies a product theme to a subtree. It never touches `<html>`, `<head>` or `<body>` unless `target="document"` is passed.

```tsx
import { CynosureTheme, createTheme, useColorMode } from "@arshad-shah/cynosure";

const theme = createTheme({ accent: "#e8462e", scale: "compact" });

export function App() {
  const { mode } = useColorMode(); // persisted; never throws
  return (
    <CynosureTheme theme={theme} mode={mode}>
      …
    </CynosureTheme>
  );
}
```

| Prop       | Default | Notes                                                                                  |
| ---------- | ------- | -------------------------------------------------------------------------------------- |
| `theme`    | inherit | Result of `createTheme()`. Applied as custom properties on the wrapper.                |
| `mode`     | inherit | `light`, `dark` or `system` (follows the OS).                                          |
| `contrast` | inherit | `normal`, `more` or `system`.                                                          |
| `target`   | `self`  | `document` themes `<html>`; only for apps that own the page, never in content scripts. |
| `as`       | `div`   | The wrapper uses `display: contents`, so it never affects layout.                      |

`useColorMode({ storage, key })` accepts any `{ get, set }` storage, sync or async (e.g. `chrome.storage`).

`themeInitScript({ key, selector })` returns the text of a tiny script that applies the mode saved in localStorage before the first paint, so dark-mode visitors never see a light flash. Cynosure injects nothing: place it early in the page yourself (inline in `<head>`, or written to a file when the content security policy forbids inline scripts). It marks `<html>` by default (apps that own the page) or the element matching `selector`. It reads localStorage only, so async storage such as `chrome.storage` cannot use it.

```astro
<script is:inline set:html={themeInitScript()} />
```

## Used by

All products (theme root).
