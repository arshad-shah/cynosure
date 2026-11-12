# DeviceFrame

A phone, tablet or browser window drawn in CSS around a screenshot, a video or a live demo. The screen keeps its ratio at any width (it is an [AspectRatio](../AspectRatio/README.md)), the content is clipped to its rounded corners, and a phone's or tablet's bezel, corners and camera scale with the frame.

```tsx
import { DeviceFrame } from "@arshad-shah/cynosure";

<DeviceFrame>
  <img src="/home.png" alt="The app's home screen" />
</DeviceFrame>

<DeviceFrame device="tablet" orientation="landscape" label="The editor on a tablet">
  <img src="/editor.png" alt="" />
</DeviceFrame>

<DeviceFrame device="browser" url="example.com/pricing">
  <PricingDemo />
</DeviceFrame>
```

| Prop                  | Default    | Notes                                                                                                                                                                               |
| --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `device`              | `phone`    | `phone` · `tablet` · `browser`                                                                                                                                                      |
| `orientation`         | `portrait` | `portrait` · `landscape`; phone and tablet only                                                                                                                                     |
| `ratio`               | per device | Screen width ÷ height upright: phone 9 / 19.5, tablet 3 / 4, browser 16 / 10                                                                                                        |
| `url`                 | –          | Address in the browser bar (decoration)                                                                                                                                             |
| `label`               | –          | Makes the frame a `figure` with this accessible name                                                                                                                                |
| `safeArea`            | auto       | Phone: keep content clear of the camera island. By default live content is kept clear and a screenshot, video or canvas fills the screen; `true` or `false` decides for any content |
| `children`            | –          | What the screen shows; each child is stretched to the screen                                                                                                                        |
| `className` / `style` | –          | Layout only (width, margin). The height follows from the width                                                                                                                      |
| `ref`                 | –          | The root (`div`, or `figure` with `label`)                                                                                                                                          |
- It is as wide as its container, up to `--cy-device-frame-phone-width` (288px by default) for a phone and `--cy-device-frame-tablet-width` (576px) for a tablet. A landscape device is as tall as its upright one is wide. A browser has no cap.
- Landscape swaps the screen's ratio and moves the camera to the left edge (the device turns, so this is physical, not reversed in right-to-left layouts).
- Children are stretched over the screen and clipped to it; an image or a video covers it (`object-fit: cover`). Content in the screen keeps its own stacking (the screen isolates it), so a demo's overlay never covers the camera.
- **Colours.** A phone or tablet is a dark device in both modes. On a light page the bezel is the ink; on a dark page it is a dark grey lifted off the page, with a lighter rim at 3:1 against the page, so it never disappears into it. The screen and the browser window follow the theme.
- **Camera.** On a phone, live content starts below the camera island (beside it when turned), as an app keeps clear of a real phone's. A screenshot, video or canvas fills the whole screen, because it has its own status bar.
- **Accessibility.** Without `label` the frame is decoration: a plain `div` that adds nothing to the accessibility tree, and the content keeps its own semantics (name the screenshot with its `alt`; controls in a live demo stay usable). With `label` it is a `figure` with that name. The browser bar is hidden from screen readers; put the address in `label` if it matters.
- **Right-to-left.** The browser dots start the bar, on the right. The address always reads left to right.

## Tokens

- `--cy-device-frame-bezel`: phone and tablet bezel
- `--cy-device-frame-edge`: hairline around the frame
- `--cy-device-frame-shadow`: shadow under the frame
- `--cy-device-frame-screen`: screen fill behind the content
- `--cy-device-frame-phone-width`, `--cy-device-frame-tablet-width`: the upright width cap
- `--cy-device-frame-browser-radius`: browser window corners
- `--cy-device-frame-browser-bar`: browser bar fill
- `--cy-device-frame-dot`: the three window dots
