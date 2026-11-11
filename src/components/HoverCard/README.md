# HoverCard

A passive preview beside the thing it previews: a large thumbnail of a page while its small one is hovered or focused, a summary of a file in a list. It takes no pointer input or focus and is hidden from assistive technology, because it only repeats what its anchor already names.

```tsx
import { HoverCard } from "@arshad-shah/cynosure";

<HoverCard open={hovered !== null} anchor={thumbRef}>
  <img src={large} alt="" />
</HoverCard>;
```

| Prop                  | Default | Notes                                                                  |
| --------------------- | ------- | ---------------------------------------------------------------------- |
| `open`                | –       | The owner decides when (hover, focus, a held finger)                   |
| `anchor`              | –       | A ref to an element, or a virtual anchor (`{ getBoundingClientRect }`) |
| `placement`           | `end`   | `top` · `bottom` · `start` · `end`; flips and slides to stay on screen |
| `className` / `style` | –       | Layout only                                                            |
- Shown in the top layer through the Popover API, rendered in place (nothing is added to `<body>`), so it works inside shadow roots.
- Text that describes a control belongs in Tooltip; anything people click belongs in Popover.

## Tokens

- `--cy-hover-card-background`, `--cy-hover-card-radius`, `--cy-hover-card-padding`, `--cy-hover-card-offset`

## Used by

The tools app's page rails and file grids (page and image previews), and Aperture's element previews.
