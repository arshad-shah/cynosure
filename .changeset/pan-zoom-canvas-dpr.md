---
"@arshad-shah/cynosure": minor
---

PanZoomCanvas's `renderScreen` gets the screen's `dpr`, `canvasProps` to size a `<canvas>` in device pixels, and a `transform` to draw in canvas units; it draws again when the window moves to a screen of another density.
