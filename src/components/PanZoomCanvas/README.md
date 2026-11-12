# PanZoomCanvas

A surface to pan and zoom freely in both directions, for diagrams, schemas, maps and boards. Products place their content in canvas units and keep their own layout and drawing; the canvas moves and scales it. On the same zoom core as DocumentViewport.

```tsx
import { PanZoomCanvas, type PanZoomCanvasHandle } from "@arshad-shah/cynosure";

const canvas = useRef<PanZoomCanvasHandle>(null);
<PanZoomCanvas ref={canvas} label="Schema" bounds={{ x: 0, y: 0, width: 2400, height: 1600 }} minimap>
  {tables.map((t) => (
    <TableCard key={t.id} style={{ position: "absolute", left: t.x, top: t.y }} {...t} />
  ))}
</PanZoomCanvas>;
canvas.current?.centreOn(tableRect);
```

| Prop                                    | Default      | Notes                                                                                                                         |
| --------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `label`                                 | –            | Names the canvas region                                                                                                       |
| `view` / `defaultView` / `onViewChange` | fit `bounds` | `{ x, y, scale }`: canvas point (x, y) shows at screen (x times scale plus view.x, and the same for y)                        |
| `minScale` / `maxScale`                 | 0.25 / 8     | The zoom's limits as scales (0.2 is 20%): wheel, pinch, keys, `zoomTo` and fitting keep to them                               |
| `bounds`                                | –            | The content's extent in canvas units: for fitting and the minimap                                                             |
| `minimap`, `renderMinimap`              | `false`, –   | A minimap of `bounds` with the view on it; draw a small version of the content                                                |
| `renderScreen`                          | –            | A layer in screen pixels under the content, given `{ view, width, height, dpr, canvasProps, transform }` on every view change |
| `labels`                                | –            | `zoom(percent)`                                                                                                               |
| ref                                     | –            | `fit(rect?)`, `zoomTo(percent)`, `centreOn(rect)`                                                                             |
- Pointer: drag the empty background (or hold Space and drag anywhere) to pan; the wheel pans; Ctrl/Cmd+wheel zooms around the pointer. Presses on your content stay yours.
- Touch: one finger pans, two pinch-zoom around their midpoint.
- Keyboard (focus on the canvas): arrows pan (Shift: further), Ctrl/Cmd and = - 0 zoom, Shift+1 fits. Zoom changes are announced.
- The minimap: press where to look, or drag.
- An engine that paints the whole scene into a `<canvas>` uses `renderScreen` (below). The layer does not take the pointer, so pressing it pans; hit-test from your own pointer handlers with `(clientX - left - view.x) / view.scale`.
- Give it a height. Content is laid out left to right in canvas units; it sets its own direction.

## Painting into a canvas

```tsx
<PanZoomCanvas label="Graph" bounds={extent} renderScreen={(screen) => <GraphCanvas {...screen} />} />;

function GraphCanvas(screen: CanvasScreen) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(...screen.transform);
    drawScene(ctx); // in canvas units
  });
  return <canvas ref={ref} {...screen.canvasProps} />;
}
```

The screen is `{ view, width, height, dpr, canvasProps, transform }`: `canvasProps` sizes your canvas in device pixels (sharp on dense screens) at the canvas's CSS size, and `transform` lets you draw in canvas units. `dpr` follows the window to another screen or a browser zoom.

Render your own component from `renderScreen` (as above) rather than passing it directly, so its hooks belong to it.

## Tokens

- `--cy-pan-zoom-canvas-background`, `--cy-pan-zoom-canvas-minimap-width`
