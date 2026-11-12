---
"@arshad-shah/cynosure": minor
---

New `Stat`: a KPI tile on a Card with a label, a value in tabular figures, an optional unit, description and icon, and a `delta` that draws an arrow and the change in a tone and is spoken as "up 12%" (the direction comes from the sign or is given, and the words translate through `labels`). The label and figures are a description list, so they are read together. `href` makes the whole tile one link; `as="li"` keeps a linked stat inside its list item.
