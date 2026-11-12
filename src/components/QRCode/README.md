# QRCode

A QR code drawn as one SVG path: crisp at any size, coloured by tokens. It encodes the text itself (`src/foundations/qr.ts`, no dependency): versions 1 to 40, levels L, M, Q and H, numeric, alphanumeric or UTF-8 byte mode, and the mask with the lowest standard penalty. The output matches the `qrcode` npm package module for module (unit-tested).

```tsx
import { QRCode } from "@arshad-shah/cynosure";
import { globe } from "@arshad-shah/cynosure/icons";

<QRCode value="https://cynosure.arshadshah.com" label="Open the documentation on your phone" />
<QRCode value={inviteUrl} size="lg" icon={<Icon icon={globe} />} />
<QRCode value={wifi} size={240} level="Q" />
```

| Prop                  | Default   | Notes                                                                                     |
| --------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `value`               | –         | The text to encode, usually a URL                                                         |
| `size`                | `md`      | `sm` · `md` · `lg` from the tokens, or a number of pixels; never wider than its container |
| `level`               | `M`       | Error correction: `L` 7%, `M` 15%, `Q` 25%, `H` 30% of the code can be lost               |
| `quietZone`           | `4`       | Light modules around the code; scanners need them (the standard asks for 4)               |
| `label`               | "QR code" | Accessible name; say where it leads                                                       |
| `labels`              | –         | `{ name }`: the default name                                                              |
| `icon`                | –         | A logo in the centre, on the light colour; raises the level to `H`                        |
| `className` / `style` | –         | Layout only                                                                               |
| `ref`                 | –         | The root (a `div` with `role="img"`)                                                      |
- **Dark on light, always.** Many phone cameras cannot read an inverted code (light modules on dark), so the code keeps dark modules on a light square in dark mode too: the root sets `color-scheme: light`, so the theme's `light-dark()` colours resolve to the light palette's ink and surface inside it. The light square and its quiet zone also set the code apart from a dark page. Forced-colours mode leaves it alone for the same reason. To change the colours, set both tokens and keep the dark one dark (at least 4.5:1).
- **Size.** A longer value needs a denser code (a higher version), drawn in the same box. At `sm` (96px by default) keep URLs short. `value` longer than the code can hold (2,953 bytes at `L`, 1,273 at `H`) throws a `RangeError`.
- **Icon.** It covers about 4% of the code (`--cy-qr-code-icon-size`, 20% of the width); level H recovers what it hides. Keep it at 22% or below: in decoder checks, larger icons hid too much of small codes.
- **Accessibility.** The root is one image with a name; the SVG and the icon inside it are hidden. A screen reader cannot scan it, so show the link or the text next to it as well.
- **Text encoding.** Byte mode is UTF-8 without an ECI header, as most encoders do; current phone scanners read it as UTF-8.

## Without React

The encoder is exported for Astro components, static HTML and files:

```ts
import { qrMatrix, qrPath, qrToSvg } from "@arshad-shah/cynosure";

qrToSvg("https://example.com", { size: 160, label: "Example" }); // standalone SVG, black on white
qrMatrix("HELLO", { level: "Q" }); // boolean[][] (true is dark), no quiet zone
qrPath(matrix, 4); // path data, one unit per module, offset by the quiet zone
```

`qrToSvg` writes its colours into the SVG (`color`, `background`; black on white by default), so it scans without the stylesheet.

## Tokens

- `--cy-qr-code-color`: dark modules (default: the light palette's ink)
- `--cy-qr-code-background`: light modules and quiet zone (default: the light palette's surface)
- `--cy-qr-code-size-{sm,md,lg}`: width and height per size
- `--cy-qr-code-icon-size`: the centred icon, as a share of the width
- `--cy-qr-code-radius`: corner radius of the square

## Used by

Product sites (a link to the mobile app or the extension store on a desktop page) and sharing panels (an invite or a sign-in link to open on a phone).
