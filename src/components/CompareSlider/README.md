# CompareSlider

Before and after, one over the other, split by a divider people move: an edited image against its original, a redesign against the old page, two renders of the same document. An APG slider; dragging goes through detent.

```tsx
import { CompareSlider } from "@arshad-shah/cynosure";

<CompareSlider before={<img src={original} alt="Original" />} after={<img src={edited} alt="Edited" />} />;
```

| Prop                  | Default | Notes                                                                       |
| --------------------- | ------- | --------------------------------------------------------------------------- |
| `before` / `after`    | –       | Any content, the same size; `before` shows on the start side of the divider |
| `value` / `onChange`  | –       | Percent of the width showing `before`; `defaultValue` 50 when uncontrolled  |
| `showTags`            | `true`  | The "Before" and "After" tags in the corners                                |
| `labels`              | –       | `divider`, `position(percent)`, `before`, `after`                           |
| `className` / `style` | –       | Layout only                                                                 |
- Press anywhere to jump the divider there and drag to follow, with a mouse, pen or finger. A finger moving sideways drags at once; an upward swipe still scrolls the page. Escape mid-drag puts it back.
- Keyboard on the divider: arrows ±1, Shift+arrows and Page Up/Down ±10, Home and End.
- The divider's hit area is at least 24px, 44px on touch screens. The split stays left-to-right in RTL pages, like the pictures.

## Tokens

- `--cy-compare-slider-divider`: divider and grip colour
- `--cy-compare-slider-grip-size`

## Used by

The tools app's image editors (compare an edit with the original) and before/after showcases on the sites.
