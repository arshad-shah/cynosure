---
"@arshad-shah/cynosure": minor
---

New `LiveRegion` foundation and `useLiveMessage` hook: the one hidden live region every component announces through, so the same message twice is spoken twice. FileDrop, TagInput, Tabs, VirtualList and SortableList now announce a repeated message again (a second "1 file added"), and every component's hidden region carries `aria-live` and `aria-atomic`.
