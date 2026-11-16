# ZoomControls

Zoom out, the current percent (a menu of fit modes and preset percents) and zoom in, for a DocumentViewport, a PanZoomCanvas or any zoomable view, with optional Fit to view and Actual size buttons. A Toolbar of IconButtons and a Menu: one tab stop, arrow keys between them.

```tsx
// A document
<ZoomControls zoom={zoom} percent={scale * 100} onZoomChange={setZoom} />

// A canvas: no document fit modes, Fit to view and Actual size buttons, the canvas's own steps and limits
<ZoomControls
  percent={view.scale * 100}
  min={20}
  max={300}
  fits={[]}
  buttons={["fit", "actual-size"]}
  onZoomChange={(z) => canvas.current?.zoom(z)}
/>
```

| Prop           | Default                         | Notes                                                                                                 |
| -------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `zoom`         | –                               | The `ZoomSetting` now: marks the menu's choice. Without it, the preset equal to `percent` is marked   |
| `onZoomChange` | –                               | Gets a `ZoomSetting`: `{ kind: "percent", value }`, `{ kind: "fit-width" }` or `{ kind: "fit-page" }` |
| `percent`      | –                               | What the view comes to now (fit modes depend on the view): shown, stepped from                        |
| `min` / `max`  | 25 / 800                        | Where zoom out and zoom in stop (as a PanZoomCanvas's `min` and `max`)                                |
| `steps`        | 25, 33, 50 … 800                | The percents zoom in and out go through                                                               |
| `presets`      | 50, 75, 100, 125, 150, 200, 400 | Percents in the menu (those between `min` and `max`)                                                  |
| `fits`         | `["fit-width", "fit-page"]`     | Fit modes in the menu, in order; `[]` for none                                                        |
| `buttons`      | –                               | After zoom in: `"fit"` (reports `fit-page`, the whole content) and `"actual-size"` (100%)             |
| `size`         | `sm`                            |                                                                                                       |
| `labels`       | –                               | `group`, `zoomIn`, `zoomOut`, `menu(percent)`, `fitWidth`, `fitPage`, `fit`, `actualSize`             |
- Zoom in and out go through the steps (… 90, 100, 110, 125 … unless `steps` is given) and stop at `min` and `max` (25% and 800% unless given).
- The menu button reads "Zoom 125%"; the current choice is checked.
- A PanZoomCanvas applies every choice with its handle's `zoom(setting)`: a percent zooms around the centre, `fit-page` fits its `bounds`, `fit-width` fits their width. A DocumentViewport takes the setting as its `zoom`.
- Actual size is disabled when 100% is outside `min` and `max`.

## Tokens

None of its own: Toolbar, Button and Menu tokens.
