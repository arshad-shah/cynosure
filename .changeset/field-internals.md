---
"@arshad-shah/cynosure": patch
---

KeyValueEditor and Checklist no longer reach into the Checkbox and TextField they render: KeyValueEditor lays out its checkbox through a class of its own and hides its file picker with the shared `cy-visually-hidden` class, Checklist finds its focus targets through its own classes, and TagInput's announcer uses `cy-visually-hidden`.
