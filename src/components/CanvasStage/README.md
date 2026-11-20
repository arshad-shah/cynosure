# CanvasStage

A host for a product's own drawing surface (a canvas an animation engine paints, a player, a renderer): a sized stage, a file drop target over the whole of it, and a centred overlay slot for a picker before a file is open or progress while it loads. The product keeps its drawing; the stage gives it the plumbing that would otherwise be raw elements.

```tsx
import { CanvasStage, FileDrop, ProgressBar } from "@arshad-shah/cynosure";

<CanvasStage
  label="Animation"
  ratio={16 / 9}
  accept=".riv"
  onFiles={([file]) => open(file)}
  overlay={
    loading ? (
      <ProgressBar label="Loading" />
    ) : file ? undefined : (
      <FileDrop variant="button" accept=".riv" onFiles={([f]) => open(f)} />
    )
  }
>
  <canvas ref={canvasRef} aria-label="Hero animation" />
</CanvasStage>;
```

| Prop                  | Default | Notes                                                                                                     |
| --------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `label`               | –       | Names the stage (a group)                                                                                 |
| `ratio`               | –       | Width divided by height, kept at any width. Without it the stage fills its parent's height                |
| `children`            | –       | The drawing surface, stretched to fill the stage                                                          |
| `overlay`             | –       | Centred over the surface; takes presses, while presses around it reach the surface                        |
| `onFiles`             | –       | Makes the whole stage a file drop target; called with the dropped files that pass `accept` and `multiple` |
| `onReject`            | –       | Called with the dropped files turned away                                                                 |
| `accept`              | any     | As for `<input accept>`                                                                                   |
| `multiple`            | `false` | Take every accepted file; otherwise the first only                                                        |
| `disabled`            | `false` | Turns off dropping                                                                                        |
| `labels`              | –       | `drop` ("Drop to open"), shown while files are over the stage                                             |
| `className` / `style` | –       | Layout only                                                                                               |
| `id`, `data-*`, `ref` | –       | Set on the root element                                                                                   |

## Behaviour

- **Size.** With `ratio` the stage keeps it at any width; without one it fills its parent's height, at least `--cy-canvas-stage-min-height`. The surface is stretched to the stage; size a canvas's pixels to it yourself (`useCanvasSize` style).
- **Overlay.** Centred, and only its content takes presses; around it, presses reach the surface. It hides while files are dragged over the stage, and stays mounted while hidden (its state is kept, and a drag that came in over it still ends the drop hint when it leaves).
- **Dropping files.** With `onFiles`, files dragged anywhere over the stage show `labels.drop` over it and a ring; a drop passes the files that match `accept` (the first one only, unless `multiple`) to `onFiles` and the rest to `onReject`. Dragged text and links are left alone. Give keyboard users another way in (a FileDrop button in the overlay or a toolbar): dropping is pointer-only.

## Tokens

- `--cy-canvas-stage-background`: behind the surface (default `--cy-color-soft`)
- `--cy-canvas-stage-radius`: corner radius (default `--cy-radius-md`)
- `--cy-canvas-stage-min-height`: smallest height without `ratio` (default five times `--cy-space-10`)
- `--cy-canvas-stage-drop-background`: over the stage while files are dragged over it (default the accent at 18%)
