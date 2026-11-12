---
"@arshad-shah/cynosure": patch
---

SignaturePad draws faster: finished strokes keep their outline, the canvas is reallocated only when its size or pixel density changes, and the stroke in progress is drawn once per frame without re-rendering. What it draws and reports is unchanged.
