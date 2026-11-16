---
"@arshad-shah/cynosure": patch
---

ContextMenu reports only real open and close changes through `onOpenChange`, so effects that run twice (React StrictMode, a page kept alive with `Activity` and shown again) no longer call it without its target. Tabs, whose tab menu read `.value` of that missing target, no longer throws.
