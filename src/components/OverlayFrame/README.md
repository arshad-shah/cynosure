# OverlayFrame

A frame whose one child (a scroller) fills it, with an `overlay` pinned at the bottom centre that stays put while the content scrolls under it: a "3 new" pill, a "jump to latest" button. ScrollArea and VirtualList are built on it, so their `overlay` props look and stack the same; reach for it directly only for a scroller of your own.

```tsx
import { OverlayFrame } from "@arshad-shah/cynosure";

<OverlayFrame overlay={unseen > 0 && <Button onClick={jump}>{`${unseen} new`}</Button>}>
  <div style={{ overflow: "auto" }}>…</div>
</OverlayFrame>;
```

| Prop                  | Default | Notes                                                                      |
| --------------------- | ------- | -------------------------------------------------------------------------- |
| `overlay`             | –       | Pinned at the bottom centre; `null`, `undefined` or `false` render nothing |
| `children`            | –       | One element that fills the frame (it shares the frame's single grid cell)  |
| `className` / `style` | –       | Layout only                                                                |

The frame is always rendered, overlay or not, so an overlay that comes and goes never remounts the content or loses its scroll position. The overlay sits outside the content (outside a listbox or a named region), above content raised with a z-index up to 2 (a sticky heading).

## Tokens

- `--cy-overlay-frame-offset`: space between the bottom edge and the overlay (default `--cy-space-4`)
- `--cy-overlay-frame-layer`: stacking order of the overlay over the content (default 3)
