---
"@arshad-shah/cynosure": patch
---

Overlays and focus: a modal Popover's Tab trap no longer lets focus out past a roving group or a radio group at its end. CommandPalette opened from a menu item returns focus to the menu's button. Dialog, Sheet, ProgressOverlay and CommandPalette render open in jsdom (no dialog API). A Dialog that cannot be dismissed stays open when the browser closes it. A hidden HoverCard is inert on React 18 too. Escape on a TagInput tag no longer also closes the Dialog around it. Roving focus finds the focused item inside shadow roots.
