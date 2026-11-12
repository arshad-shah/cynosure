# TitleBar

The title bar of an installed app that draws its own: a frameless Electron window, or an installed web app using Window Controls Overlay. The whole bar drags the window (`app-region: drag`); every control inside it (buttons, links, fields, menubar titles, anything focusable) opts out automatically, so it stays clickable. It holds leading content (a Menubar), a centred title, trailing content and, where the app draws them, the window controls.

```tsx
import { Menubar, TitleBar } from "@arshad-shah/cynosure";

<TitleBar
  label="Verql"
  leading={<Menubar label="Application" menus={menus} size="sm" onSelect={run} />}
  controls={{ minimize, toggleMaximize, close, maximized }}
  onHeightChange={(h) => window.app.setTrafficLightsCentre(h)}
>
  orders.sql — Verql
</TitleBar>;
```

| Prop                   | Default       | Notes                                                                                                                             |
| ---------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `children`             | –             | The title, centred on the bar; ends in an ellipsis when there is no room                                                          |
| `leading` / `trailing` | –             | Content at the inline start / end (before the controls)                                                                           |
| `leadingInset`         | `0`           | Pixels kept clear at the inline start for buttons the system draws (macOS traffic lights: about 80)                               |
| `overlay`              | `false`       | Window Controls Overlay: fixed to `env(titlebar-area-x/y/width/height)`; falls back to the top, full width and the `height` token |
| `controls`             | –             | `{ minimize, toggleMaximize, close, maximized }`; each button shows only when its callback is given                               |
| `onHeightChange`       | –             | `(height) => void` with the border-box height, on mount and on every change (ResizeObserver)                                      |
| `label`                | `"Title bar"` | Accessible name of the bar (a `group`)                                                                                            |
| `labels`               | English       | `{ minimize, maximize, restore, close }`                                                                                          |
| `className` / `style`  | –             | Layout only                                                                                                                       |

## Window controls

`controls` draws the window controls at the inline end, flush with the edge and as tall as the bar: IconButtons with the Facet `minus`, `windowMaximize` (or `windowRestore` and the name "Restore" when `maximized`) and `close` icons. Close fills with the danger colour on hover. They are a part of TitleBar, not a component of their own, because they have one right place (after the trailing content, at the window's edge) and take the bar's height. Leave `controls` out where the system draws its own: macOS (use `leadingInset`) and Window Controls Overlay.

In right-to-left text the bar mirrors: the controls are at the left, close outermost, as Windows draws its caption buttons in right-to-left languages.

## Accessibility and touch

- The bar is a `group` named by `label`. The controls are buttons named Minimize, Maximize or Restore, and Close (overridable through `labels`), reached with Tab and pressed with Enter or Space.
- Each control's hit area is at least 24px, and 44px on coarse pointers.

## Tokens

- `--cy-title-bar-height`: Bar height. Default `--cy-control-height-lg`. In overlay mode the window's `titlebar-area-height` wins when the browser gives one.
- `--cy-title-bar-bg`: Bar background. Default `--cy-color-surface`.
- `--cy-title-bar-ink`: Text colour. Default `--cy-color-ink`.
- `--cy-title-bar-border`: The line under the bar. Default `--cy-color-line`.
- `--cy-title-bar-padding-inline`: Space at the bar's ends, after `leadingInset`. Default `--cy-space-4`.
- `--cy-title-bar-gap`: Space between the leading, title and trailing content. Default `--cy-space-4`.
- `--cy-title-bar-title-font-size`: The title's font size. Default `--cy-font-size-sm`.
- `--cy-title-bar-control-width`: Width of each window control. Default 46px (`--cy-space-10` + `--cy-space-3`).
- `--cy-title-bar-close-hover-bg`: Close's fill on hover. Default `--cy-color-danger`.
- `--cy-title-bar-close-hover-ink`: Close's icon colour on hover. Default `--cy-color-on-danger`.
- `--cy-title-bar-z`: Stacking order in overlay mode. Default one below `--cy-z-dropdown`.
