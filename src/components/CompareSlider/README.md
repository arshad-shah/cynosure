# CompareSlider

Before and after, one over the other, split by a divider people move: an edited image against its original, a redesign against the old page, two renders of the same document. An APG slider; dragging goes through detent.

```tsx
import { CompareSlider } from "@arshad-shah/cynosure";

<CompareSlider beforeSrc={original} beforeAlt="Original" afterSrc={edited} afterAlt="Edited" />;
<CompareSlider before={<canvas ref={left} />} after={<canvas ref={right} />} />;
```

| Prop                     | Default | Notes                                                                      |
| ------------------------ | ------- | -------------------------------------------------------------------------- |
| `before` / `after`       | –       | Any content, stretched to the shared box; `before` shows on the start side |
| `beforeSrc` / `afterSrc` | –       | A picture's address instead, with `beforeAlt` / `afterAlt` (required)      |
| `value` / `onChange`     | –       | Percent of the width showing `before`; `defaultValue` 50 when uncontrolled |
| `showTags`               | `true`  | The "Before" and "After" tags in the corners                               |
| `labels`                 | –       | `divider`, `position(percent)`, `before`, `after`                          |
| `className` / `style`    | –       | Layout only                                                                |
- **One box:** both sides share the shape of the first picture, video or canvas (the before side's, else the after side's), as wide as the container. Pictures, videos and canvases are contained in it and centred, so two of different sizes or shapes line up; any other child is stretched to it (an [Image](../Image/README.md) with the same `ratio` and `fit="contain"` lines up too). With no media the sides lay out in the flow, the taller setting the height.
- Press anywhere to jump the divider there and drag to follow, with a mouse, pen or finger. A finger moving sideways drags at once; an upward swipe still scrolls the page. Escape mid-drag puts it back.
- Keyboard on the divider: arrows ±1, Shift+arrows and Page Up/Down ±10, Home and End.
- The divider's hit area is at least 24px, 44px on touch screens. The split stays left-to-right in RTL pages, like the pictures.

## Tokens

- `--cy-compare-slider-divider`: divider and grip colour
- `--cy-compare-slider-grip-size`
