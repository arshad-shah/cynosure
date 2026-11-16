---
"@arshad-shah/cynosure": patch
---

Card: a header's `actions` move under the title when the two no longer fit on one row, instead of squeezing the title to a sliver on a phone. The title keeps at least `--cy-card-title-min` (12rem, new token `card.titleMin`) before the actions wrap, and a long row of actions wraps within the card.
