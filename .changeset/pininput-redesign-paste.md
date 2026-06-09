---
'@arshad-shah/cynosure-react': minor
---

Rework `PinInput`. Cells are now raised, rounded tiles with a clear
lift-on-focus active state (scale + accent ring + soft glow) and an
accent-tinted filled state, replacing the flat generic boxes.

Paste/autofill is more robust: pasting a full code into any cell distributes
it across the cells (skipping non-matching characters like spaces or dashes),
and a multi-character value from iOS SMS one-time-code autofill is handled the
same way (previously only the last character was kept). New `separator` prop
renders a divider at the midpoint for a `123–456` grouping.
