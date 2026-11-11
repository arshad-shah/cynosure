---
"@arshad-shah/cynosure": minor
---

SegmentedControl: two controls given the same `name` no longer share one selection. The segments are grouped under a name of the control's own (with ids of its own), and `name` submits the value through a hidden field, so choosing in one control never clears another and a label never points at another control's segment. A form's reset still restores the default. The small size is now exactly as tall as other small controls (26px, was 28px); its segments keep a 24px hit area.
