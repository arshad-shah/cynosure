---
'@arshad-shah/cynosure-react': patch
---

Fix the Textarea corner resize grip not working with touch/mobile drag. The
grip is driven by pointer events, but without `touch-action: none` the browser
claimed a finger-drag as a scroll/pan and fired `pointercancel`, so resizing
only worked with a mouse. The grip now sets `touch-action: none` and the drag
handler also tears down on `pointercancel`.
