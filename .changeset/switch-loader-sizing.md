---
'@arshad-shah/cynosure-react': patch
---

Fix the `Switch` loading spinner being clipped by the small off-state thumb.
While loading, the thumb now stays full-size at whichever position it's
settling toward — so the spinner fits even when toggling *off* — and shrinks
back to the small resting thumb only once loading ends. The spinner is also
sized to sit comfortably inside the thumb at every control size.
