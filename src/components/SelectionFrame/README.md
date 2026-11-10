# SelectionFrame

Move, resize and rotate one selected object (a box on a PDF page, a shape on a canvas, a crop area): drag it or its handles with a mouse, pen or finger, or focus it and use the keys. You own the geometry; the frame proposes changes.

```tsx
import { SelectionFrame } from "@arshad-shah/cynosure";

<div style={{ position: "relative" }}>
  <Page />
  <SelectionFrame
    label="Text box: Hello"
    box={field.box} // { x, y, width, height } in your units
    rotate={field.rotate}
    scale={zoom} // CSS pixels per unit
    resizable
    rotatable
    bounds={{ width: page.width, height: page.height }}
    onChange={(box, rotate) => preview(box, rotate)}
    onCommit={(box, rotate) => save(box, rotate)} // one undo step
  />
</div>;
```

| Prop                      | Default    | Notes                                                                                       |
| ------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `box` / `rotate`          | – / `0`    | In your units and degrees (clockwise)                                                       |
| `scale`                   | `1`        | CSS pixels per unit                                                                         |
| `resizable` / `rotatable` | `false`    | Eight resize handles / a rotate handle above                                                |
| `keepAspect`              | `false`    | Keep the ratio (Shift does it for one drag)                                                 |
| `minSize`, `bounds`       | `1`, –     | Smallest size; area to stay inside                                                          |
| `step` / `largeStep`      | `1` / `10` | Arrow-key amounts                                                                           |
| `snap`                    | –          | Adjust each proposed box (grids, guides)                                                    |
| `onChange` / `onCommit`   | – / –      | Preview while dragging or holding a key / the end of one change (pointer up, key up, Enter) |
| `labels`                  | –          | `roleDescription` ("selection")                                                             |

Keys: arrows move (Shift ×10), Alt+arrows resize the frame's own right and bottom edges, `[` and `]` rotate by 15°, Escape cancels a held key or a drag, Enter commits a held key. Each key press is one undo step.

The geometry helpers are exported for your own tools: `moveBy`, `resizeBy`, `resizeByKey`, `contain`, `angleFrom`.

- Pointer gestures go through detent (`bindPointer`): one input path for mouse, touch and pen; on touch, a finger held briefly drags and a quick swipe still scrolls.
- Handles follow the rotation; a drag is read in the object's own axes so the opposite edge stays put.
- Handles have a 24px hit area (44px on touch screens).

## Tokens

- `--cy-selection-frame-color`, `--cy-selection-frame-handle-size`

## Used by

Fill-and-sign fields and the crop tool in the tools app, and canvas or page editors in other products.
