---
"@arshad-shah/cynosure": minor
---

CompareSlider zooms: `zoom` / `defaultZoom` / `onZoomChange` take DocumentViewport's `ZoomSetting` (fit page by default, fit width, or a percent of the picture's own size, 100 being actual size), so ZoomControls drives it with `onScaleChange`'s scale. Both sides scale together in a frame that keeps its size; larger than the frame they pan (drag the picture, the wheel, or the zoomed view's arrows as a tab stop), and the divider still moves by its line. `zoomable` adds Ctrl/Cmd+wheel, pinch and Ctrl/Cmd = - 0. New labels `view` and `zoom(percent)`; a new setting is announced.
