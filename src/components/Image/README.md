# Image

A picture that never shifts the layout, shows a placeholder while it loads and something sensible when it fails.

```tsx
import { Image } from "@arshad-shah/cynosure";

<Image src="/team.jpg" alt="The team at the 2026 offsite" ratio={16 / 9} radius="card" />

<Image src="/logo.png" alt="" width={120} height={40} />        // decorative, natural size

<Image src={url} alt="Uploaded scan" ratio="4/3" fit="contain" caption="Page 1 of 3" />
```

| Prop                  | Default | Notes                                                                                                         |
| --------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `src`                 | –       | Required. Changing it loads the new picture, also after a failure                                             |
| `alt`                 | –       | Required. `""` marks a decorative picture and hides it from assistive technology                              |
| `srcSet` / `sizes`    | –       | Passed to the `img`                                                                                           |
| `width` / `height`    | –       | Natural size in pixels, passed to the `img`. Without `ratio` they reserve the space                           |
| `ratio`               | –       | Width divided by height (`16 / 9`, `"4/3"`): the picture fills an [AspectRatio](../AspectRatio/README.md) box |
| `fit`                 | `cover` | With `ratio`: `cover` crops to fill, `contain` shows the whole picture                                        |
| `position`            | –       | With `ratio`: CSS `object-position`, such as `"top"` (the browser's default is the centre)                    |
| `radius`              | `none`  | `none`, `sm`, `md`, `lg`, `card`, `full`: corners from the radius tokens                                      |
| `loading`             | `lazy`  | `lazy` or `eager`. `decoding` is always `async`                                                               |
| `placeholder`         | –       | Shown while loading, in place of the [Skeleton](../Skeleton/README.md)                                        |
| `fallback`            | –       | Shown on error, in place of the box with the `image` icon and the `alt` text                                  |
| `caption`             | –       | Wraps the picture in a `figure` with a `figcaption` that names it                                             |
| `onLoad` / `onError`  | –       | The `img` events. The fallback shows as well as `onError` being called                                        |
| `className` / `style` | –       | Layout only, on the root (the `figure` when there is a caption)                                               |
| `ref`                 | –       | The `img` element (none while the fallback is shown)                                                          |
- **No layout shift:** with `ratio` the box has its height before the picture arrives. Without it, `width` and `height` reserve the space, scaled down to the container. With neither, the picture takes no space until it loads.
- **Loading:** a Skeleton covers the box (it stops moving under reduced motion and is hidden from assistive technology). The picture stays invisible until it has loaded, then fades in.
- **Error:** the `img` is replaced by the fallback, in the same box (the ratio, or `width` by `height`). The default fallback shows the `alt` text; for a decorative picture it shows only the icon and is hidden from assistive technology.
- **Already loaded:** a picture that finished before React attached (cached, or in the server's HTML) is shown at once. When it came in the server's HTML, `onLoad` and `onError` are not called: the event has passed.
- **With a ratio or a caption** the root is a block (`div` or `figure`) as wide as its container. Otherwise it is an inline `span` the size of the picture, never wider than its container.
- Dragging, the context menu and other native behaviour are left alone. Nothing changes in right-to-left layouts: pictures are not mirrored and `position` is physical, as in CSS.

## Tokens

- `--cy-image-radius`: corner radius of every Image, whatever its `radius` prop says
- `--cy-image-fallback-background`: fill of the default fallback
- `--cy-image-fallback-color`: icon and text colour of the default fallback
- `--cy-image-caption-gap`: space between the picture and its caption
- `--cy-image-caption-color`: text colour of the caption

## Used by

Screenshots and figures in the documentation site's guides, and thumbnails and previews of people's pictures in the tools app, in place of bare `img` elements with their own loading and error handling.
