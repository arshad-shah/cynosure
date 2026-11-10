# SignaturePad

A pad to draw a signature with a mouse, finger or pen. A pen's pressure and tilt shape the line; a mouse or finger draws a steady line, like a ballpoint. One pointer draws at a time, and a palm resting on the screen while a pen is in use is ignored.

```tsx
import { SignaturePad, inkToSvg } from "@arshad-shah/cynosure";

const [strokes, setStrokes] = useState<InkStroke[]>([]);

<SignaturePad label="Draw your signature" value={strokes} onChange={setStrokes} space={{ width: 600, height: 200 }} />
<Button onClick={() => setStrokes((s) => s.slice(0, -1))}>Undo</Button>
<Button onClick={() => setStrokes([])}>Clear</Button>

const svg = inkToSvg(strokes, { width: 600, height: 200, ink: "#1d1b18", weight: "medium" });
```

| Prop                 | Default            | Notes                                                                                     |
| -------------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `label`              | –                  | Accessible name of the pad                                                                |
| `value` / `onChange` | –                  | Strokes in the pad's space; `onChange` once per finished stroke. Undo and clear are yours |
| `ink`                | ink token          | Any CSS colour; without it the ink follows light and dark modes                           |
| `weight`             | `medium`           | `thin` · `medium` · `bold`                                                                |
| `space`              | shown pixels       | Coordinate space strokes are recorded in, so a signature keeps its shape at any size      |
| `width` / `height`   | full width / token | Fixed CSS pixel size                                                                      |
| `disabled`           | `false`            |                                                                                           |

Helpers: `inkToSvg(strokes, { width, height, ink, weight })` for saving or placing in a PDF, `inkPath(stroke, weight)` for one stroke's path data (only M, C and Z), and `inkOutline` / `penPressure` for custom renderers.

- Drawing cannot be done by keyboard or by most assistive technology. Always offer another way to sign beside the pad, such as typing a name or uploading an image, and say so in `aria-describedby`.
- Long-press menus are suppressed while drawing; touch gestures on the pad draw instead of scrolling.

## Tokens

- `--cy-signature-pad-ink`, `--cy-signature-pad-background`, `--cy-signature-pad-height`, `--cy-signature-pad-guide`

## Used by

Signing PDFs in the tools app (fill and sign), and any product that collects a signature.
