---
"@arshad-shah/cynosure": minor
---

`Toaster` takes `offset`, to keep toasts clear of fixed parts of an app such as a bottom tab bar on a phone. One value (a space step like `"8"` or a CSS length like `"56px"`) moves them in from the top or bottom edge they sit on; `{ block, inline }` also sets the distance from the side. The same distances are the new tokens `--cy-toast-offset-block` and `--cy-toast-offset-inline`, so an app can set them in CSS, for example only below a breakpoint. The toast region now also stays inside the device's safe area (`env(safe-area-inset-*)`) on every side.
