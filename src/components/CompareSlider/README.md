# CompareSlider

Before and after, one over the other, split by a divider people move: an edited image against its original, a redesign against the old page, two renders of the same document. An APG slider; dragging goes through detent.

```tsx
import { CompareSlider } from "@arshad-shah/cynosure";

<CompareSlider beforeSrc={original} beforeAlt="Original" afterSrc={edited} afterAlt="Edited" />;
<CompareSlider before={<canvas ref={left} />} after={<canvas ref={right} />} />;

// Fit or actual size, with ZoomControls
const [zoom, setZoom] = useState<ZoomSetting>({ kind: "fit-page" });
const [scale, setScale] = useState(1);
<ZoomControls zoom={zoom} percent={scale * 100} onZoomChange={setZoom} />
<CompareSlider beforeSrc={a} beforeAlt="Original" afterSrc={b} afterAlt="Optimised" zoom={zoom} onZoomChange={setZoom} onScaleChange={setScale} zoomable />;
```

| Prop                     | Default | Notes                                                                                                  |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------------ |
| `before` / `after`       | –       | Any content, stretched to the shared box; `before` shows on the start side                             |
| `beforeSrc` / `afterSrc` | –       | A picture's address instead, with `beforeAlt` / `afterAlt` (required)                                  |
| `value` / `onChange`     | –       | Percent of the width showing `before`; `defaultValue` 50 when uncontrolled                             |
| `zoom` / `onZoomChange`  | –       | `fit-page` (default, `defaultZoom`), `fit-width` or a percent of the picture's own size (100 = actual) |
| `onScaleChange`          | –       | The scale the zoom comes to, 1 = actual size (ZoomControls' `percent` / 100)                           |
| `zoomable`               | `false` | Ctrl/Cmd+wheel, pinch and Ctrl/Cmd = - 0 zoom; otherwise only `zoom` does                              |
| `showTags`               | `true`  | The "Before" and "After" tags in the corners                                                           |
| `labels`                 | –       | `divider`, `position(percent)`, `before`, `after`, `view`, `zoom(percent)`                             |
| `className` / `style`    | –       | Layout only                                                                                            |
- **One box:** both sides share the shape of the first picture, video or canvas (the before side's, else the after side's), as wide as the container. Pictures, videos and canvases are contained in it and centred, so two of different sizes or shapes line up; any other child is stretched to it (an [Image](../Image/README.md) with the same `ratio` and `fit="contain"` lines up too). With no media the sides lay out in the flow, the taller setting the height.
- **Zoom:** `zoom` is a ZoomSetting, as DocumentViewport's: fit (the default) shows the whole box in the frame; a percent is of the picture's own size, so `{ kind: "percent", value: 100 }` is actual size, one picture pixel per CSS pixel. With no media, 100% is the fitted box. Both sides scale together and the frame keeps its size. The limits are 25% to 800%, widened to take in fit. A new setting is announced ("Zoom 100%", `labels.zoom`).
- **Panning:** while the sides are larger than the frame, a press on the picture (mouse, pen or finger) drags it, the wheel pans it, and the frame is a tab stop (a group named "Zoomed comparison", `labels.view`) whose arrows pan 40px (200px with Shift); it stops at the picture's edges, and Escape mid-drag puts it back. A press on the divider's line still drags the divider, and its own arrows still move it. Space+drag pans too. At fit nothing pans and the wheel scrolls the page.
- **`zoomable`:** Ctrl/Cmd+wheel (and a trackpad pinch) and a two-finger pinch zoom around the pointer, Ctrl/Cmd and = - 0 zoom in, out and to 100%. Without it the page keeps Ctrl+wheel.
- At fit, press anywhere to jump the divider there and drag to follow, with a mouse, pen or finger. A finger moving sideways drags at once; an upward swipe still scrolls the page. Escape mid-drag puts it back.
- Keyboard on the divider: arrows ±1, Shift+arrows and Page Up/Down ±10, Home and End.
- The divider's hit area is at least 24px, 44px on touch screens. The split stays left-to-right in RTL pages, like the pictures.

## Tokens

- `--cy-compare-slider-divider`: divider and grip colour
- `--cy-compare-slider-grip-size`
