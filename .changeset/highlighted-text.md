---
"@arshad-shah/cynosure": minor
---

New HighlightedText: text with the parts that matched a search marked, from a fuzzy matcher's `positions` or every occurrence of a `query` (one term or several), ignoring case. It reads as one piece of text to screen readers and marks matches with the system colours in forced-colours mode. `textMatches(text, query)` filters by the same rule, and Combobox, TagInput, TextArea's mentions, Tree and CommandPalette use it, so what a list keeps and what it marks always agree.
