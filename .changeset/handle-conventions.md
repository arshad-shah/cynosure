---
"@arshad-shah/cynosure": minor
---

PanZoomCanvas takes a `handle` prop, as ScrollArea and VirtualList do, and its handle has `centerOn` (American spelling, as the rest of the API). `ref` still gives the handle and `centreOn` still works; both are kept for existing code. VirtualList's `scrollToIndex(index, { align })` takes an options object, as ScrollArea's `scrollIntoView` does; the earlier `scrollToIndex(index, "center")` form still works.
