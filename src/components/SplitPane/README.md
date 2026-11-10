# SplitPane

Two panes with a divider people can move: drag it with a mouse, pen or finger, or focus it and use the arrow keys. An APG window splitter.

```tsx
import { SplitPane } from "@arshad-shah/cynosure";

<SplitPane
  label="Resize the file list"
  start={<FileList />}
  end={<Preview />}
  defaultSize={30}
  collapsible
/>;
```

| Prop                   | Default      | Notes                                                   |
| ---------------------- | ------------ | ------------------------------------------------------- |
| `start` / `end`        | –            | The panes. The divider sets the start pane's size       |
| `label`                | –            | Accessible name of the divider ("Resize the file list") |
| `orientation`          | `horizontal` | `horizontal` (side by side) · `vertical` (stacked)      |
| `size` / `defaultSize` | – / `50`     | Start pane size in percent                              |
| `onSizeChange`         | –            | Every change, from keys or dragging                     |
| `min` / `max`          | `10` / `90`  | Limits in percent                                       |
| `step`                 | `5`          | Arrow key step in percent                               |
| `collapsible`          | `false`      | Enter collapses the start pane to 0 and restores it     |
- The divider is a focusable `role="separator"` with `aria-valuenow` (percent), `aria-valuemin`, `aria-valuemax` and `aria-controls` (the start pane).
- Arrow keys move it (Left and Right side by side, flipped in right-to-left text; Up and Down stacked); Home and End go to the limits.
- Its hit area is at least 24px wide, 44px on touch screens, while the line stays thin.
- The SplitPane fills its container; give the container a height.

- `unit="px"`: the start pane has a fixed size in pixels (a sidebar that keeps its width as the window grows). Defaults then are 240 wide, between 120 and 600, moving 16 per arrow key; the divider reads "240 pixels".

## Tokens

- `--cy-split-pane-divider-size`: line thickness
- `--cy-split-pane-divider`: line colour

## Used by

Editors, inspectors and list–detail views in the web apps and extensions (cross-product audit, 2026-11-10).
