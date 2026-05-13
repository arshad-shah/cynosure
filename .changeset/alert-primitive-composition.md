---
'@arshad-shah/cynosure-react': patch
---

Refactor `Alert` to compose from Cynosure primitives instead of bespoke CSS.
The body slot now uses `Stack` for column layout/gap, and `AlertTitle` /
`AlertDescription` render through `Text` (with `size="md" weight="semibold"`
and `size="sm"` respectively), so typography stays on-token without each
component re-encoding font weight/size/line-height. Drops the
now-unused `surfaceContent`, `surfaceTitle`, and `surfaceDescription` styles
from the shared feedback surface recipe. No public API changes.
