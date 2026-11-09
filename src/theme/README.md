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

## Used by

All products (theme root).
