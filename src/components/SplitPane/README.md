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

// A right sidebar toggled from a menu, remembering its width.
<SplitPane
  label="Resize the inspector"
  unit="px"
  anchor="end"
  start={<Editor />}
  end={<Inspector />}
  size={width}
  onSizeChange={setWidth}
  onResizeEnd={saveWidth}
  collapsed={!inspectorOpen}
  onCollapsedChange={(c) => setInspectorOpen(!c)}
/>;
```

| Prop                                                   | Default            | Notes                                                                                                 |
| ------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `start` / `end`                                        | –                  | The panes                                                                                             |
| `label`                                                | –                  | Accessible name of the divider ("Resize the file list")                                               |
| `orientation`                                          | `horizontal`       | `horizontal` (side by side) · `vertical` (stacked)                                                    |
| `unit`                                                 | `percent`          | `percent` of the whole, or `px` (keeps its size as the window grows)                                  |
| `anchor`                                               | `start`            | The pane the size belongs to: `start`, or `end` (a right sidebar, a bottom dock)                      |
| `size` / `defaultSize`                                 | – / `50` (`240`px) | Size of the anchored pane, kept while it is collapsed                                                 |
| `onSizeChange`                                         | –                  | Every change, from keys or dragging                                                                   |
| `onResizeEnd`                                          | –                  | Once, with the final size, when a drag is released or a resize key let go (to save it)                |
| `min` / `max`                                          | `10` / `90`        | Limits (`120` / `600` in px)                                                                          |
| `step`                                                 | `5`                | Arrow key step (`16` in px)                                                                           |
| `collapsible`                                          | see notes          | Enter collapses the anchored pane and restores it; on when `collapsed` or `defaultCollapsed` is given |
| `collapsed` / `defaultCollapsed` / `onCollapsedChange` | – / `false` / –    | Collapse the anchored pane from a menu or button; the size is remembered                              |
- The divider is a focusable `role="separator"` with `aria-valuenow` (the anchored pane's size, 0 when collapsed), `aria-valuemin`, `aria-valuemax` and `aria-controls` (the anchored pane).
- Arrow keys move the divider (Left and Right side by side, flipped in right-to-left text; Up and Down stacked), so with `anchor="end"` Left grows a right sidebar and Up grows a bottom dock. Home and End go to the limits. Enter collapses and restores.
- Collapsed, a key that grows the pane opens it at `min`; dragging the divider opens it where the pointer is. Escape during a drag puts back the size, and the collapse, it started from.
- Its hit area is at least 24px wide, 44px on touch screens, while the line stays thin.
- The SplitPane fills its container; give the container a height.

## Tokens

- `--cy-split-pane-divider-size`: line thickness
- `--cy-split-pane-divider`: line colour
