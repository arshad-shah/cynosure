---
"@arshad-shah/cynosure": patch
---

Tooltip (and so IconButton's label tip, Dialog's and Sheet's close button) no longer opens on focus a script moves: opening a Dialog or Sheet focused its close button for a moment and left the "Close" tip up, so the first Escape closed the tip instead of the dialog. A tip now opens on focus only when Tab, the arrows, Home, End or Page Up/Down moved it there and the trigger still has focus a frame later, and closes as soon as focus leaves the trigger by any route (a script's `focus()` included) unless the pointer rests on it. One Escape closes a Dialog, Sheet or Popover right after it opens.
