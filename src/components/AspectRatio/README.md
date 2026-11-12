# AspectRatio

A box that keeps a width-to-height ratio at any width, for an image, a video, a map, a chart or an embed. The height comes from CSS (`aspect-ratio`), so nothing is measured and nothing jumps when the content arrives.

```tsx
import { AspectRatio } from "@arshad-shah/cynosure";

<AspectRatio>
  <video src="/intro.mp4" controls />
</AspectRatio>

<AspectRatio ratio="4/3" radius="card">
  <Map />
</AspectRatio>

<AspectRatio ratio={1} style={{ inlineSize: 160 }}>
  <Chart />
</AspectRatio>
```

| Prop                  | Default  | Notes                                                                    |
| --------------------- | -------- | ------------------------------------------------------------------------ |
| `ratio`               | `16 / 9` | Width divided by height: a number, or a CSS ratio such as `"4/3"`        |
| `radius`              | `none`   | `none`, `sm`, `md`, `lg`, `card`, `full`: corners from the radius tokens |
| `children`            | –        | Each child is stretched to the box                                       |
| `className` / `style` | –        | Layout only (width, margin). The height always follows from the width    |
| `ref`                 | –        | The box (a `div`)                                                        |
- It is as wide as its container unless `style` gives it a width, and never wider than its container.
- Every direct child is stretched over the whole box, so give it one child. Content taller than the box is clipped, not allowed to stretch it.
- A direct child that is an image, a video or a canvas covers the box (`object-fit: cover`) instead of being squashed. `object-fit` does nothing to other elements, so a `div` or an iframe is only stretched. For `contain`, set `object-fit` on the child.
- A number that is not above zero (a division by zero, `NaN`) uses the default ratio. A string is passed to CSS as it is.
- It has no look of its own: no fill, no border, and it inherits text styles. It only clips to its corners.
- It is a `div` with no role, has nothing to press and is the same in right-to-left layouts.
- For a picture, use [Image](../Image/README.md) with `ratio`: it adds the loading placeholder and the error fallback.

## Tokens

- `--cy-aspect-ratio-radius`: corner radius of every AspectRatio, whatever its `radius` prop says

## Used by

Image (its `ratio` prop is an AspectRatio), DeviceFrame (its screen). Video, map and embed frames on the documentation site and the product sites.
