# ZoomControls

Zoom out, the current percent (a menu of fit width, fit page and preset percents) and zoom in, for a DocumentViewport or any zoomable view. A Toolbar of IconButtons and a Menu: one tab stop, arrow keys between the three.

```tsx
<ZoomControls zoom={zoom} percent={scale * 100} onZoomChange={setZoom} />;
```

| Prop                    | Default                         | Notes                                                                             |
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| `zoom` / `onZoomChange` | –                               | The `ZoomSetting` DocumentViewport takes                                          |
| `percent`               | –                               | What the setting comes to now (fit modes depend on the view): shown, stepped from |
| `presets`               | 50, 75, 100, 125, 150, 200, 400 | Percents in the menu                                                              |
| `size`                  | `sm`                            |                                                                                   |
| `labels`                | –                               | `group`, `zoomIn`, `zoomOut`, `menu(percent)`, `fitWidth`, `fitPage`              |
- Zoom in and out go through the usual steps (… 90, 100, 110, 125 …) and stop at 25% and 800%.
- The menu button reads "Zoom 125%"; the current choice is checked.

## Tokens

None of its own: Toolbar, Button and Menu tokens.
