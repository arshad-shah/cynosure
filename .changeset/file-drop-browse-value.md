---
"@arshad-shah/cynosure": minor
---

FileDrop: `onPick` replaces the browser's file dialog with an app's own picker, as PathField's `onPick` (the button is busy until its promise settles; chosen files are checked and arrive in `onFiles`, chosen paths in `onPaths`), and a controlled `value` lists the chosen files or paths in the zone, each with a remove button that calls `onRemove(item, index)`. New token `--cy-file-drop-file-background`.
