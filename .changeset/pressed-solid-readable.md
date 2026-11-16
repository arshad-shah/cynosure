---
"@arshad-shah/cynosure": patch
---

A pressed solid Button (and IconButton) keeps its solid fill instead of the tone's pale tint, so its text stays readable: before, the on-tone text sat on the tint (white on a light tint, or black on a dark one) and BitField's set bits could not be read. Pressed soft, outline and ghost buttons take the tone's text colour on the tint.
