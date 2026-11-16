---
"@arshad-shah/cynosure": minor
---

Checkbox and Switch (and Choice): `onChange(checked, event)` now also passes the change event, whose `nativeEvent` is the click, so `event.nativeEvent.shiftKey` reads a Shift+click for range selection; `tabIndex` reaches the input, for roving focus in grids and lists.
