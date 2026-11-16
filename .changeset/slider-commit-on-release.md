---
"@arshad-shah/cynosure": minor
---

Slider commits keyboard changes when the key is released, not on every key press: a held arrow key repeats `onChange` and calls `onCommit` once, and a key that changes nothing commits nothing. `commitDelay` (ms) waits that long after the last key, so several presses run a costly `onCommit` once; leaving the slider commits a pending change at once.
