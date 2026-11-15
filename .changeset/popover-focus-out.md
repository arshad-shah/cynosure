---
"@arshad-shah/cynosure": minor
---

Popover: a non-modal panel now closes when focus moves out of it to anything but its trigger or anchor (Tab past its last control, a click into another field), so it no longer hangs open over what has focus; Shift+Tab back to the trigger keeps it open. `closeOnFocusOut={false}` restores the old behaviour.
