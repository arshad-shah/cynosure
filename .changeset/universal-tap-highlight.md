---
'@arshad-shah/cynosure-react': patch
---

Kill the native blue tap/click highlight everywhere. The previous reset only
cleared `-webkit-tap-highlight-color` on a hand-listed set of tags, so it still
showed on elements like MultiSelect list options, the dropdown chevron, and
Accordion headers. It's now set on the document root — an inherited property —
so every element is covered and components rely on their own pressed/hover
feedback instead.
