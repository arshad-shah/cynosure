---
"@arshad-shah/cynosure": patch
---

Button (and IconButton) keep a caller's `aria-disabled` and `aria-busy` instead of overwriting them, merged with `loading`'s. A focusable `aria-disabled="true"` button ("disabled with a reason") now looks disabled and ignores presses: no `onClick`, no form submit, no confirm arming.
