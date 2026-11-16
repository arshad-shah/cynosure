---
"@arshad-shah/cynosure": patch
---

`useColorMode` and ThemeToggle follow a mode chosen in another tab under the same key (localStorage's `storage` event; clearing storage goes back to `system`). A custom `ColorModeStorage` can report changes made elsewhere through an optional `subscribe(key, onChange)` that returns an unsubscribe function (for `chrome.storage.onChanged` or a `BroadcastChannel`). Hooks in the same tab already stayed together.
