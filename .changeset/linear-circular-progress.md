---
'@arshad-shah/cynosure-react': major
---

**Breaking:** `Progress` → `LinearProgress`, `ProgressCircle` → `CircularProgress`.

Both components are now split into their own folders with compound primitives
(`LinearProgressRoot` / `Track` / `Indicator` / `Buffer` / `Segment` / `Header` /
`Label` / `Meta` / `Value`, and `CircularProgressRoot` / `Track` / `Indicator` /
`Label`). The top-level convenience wrappers still cover the common case with
flat props.

New capabilities on `LinearProgress`:

- `buffer` — YouTube-style preload indicator behind the main bar
- `segments` — stacked multi-value bar
- `label` + `meta` — upload-style header row above the track
- Auto-detected completion state at 100% (opt out with `completionState="none"`)
- `variant="ticked"` — opt-in punch-card tick motif
- Richer two-bar indeterminate motion (MUI pattern) by default

Aesthetic: both components now render as "punched" wells matching the form
controls' look — deeper recessed track + gradient indicator with subtle glow.

Subpath exports have moved too:

- `@arshad-shah/cynosure-react/progress` → `@arshad-shah/cynosure-react/linear-progress`
  and `@arshad-shah/cynosure-react/circular-progress`

**Migration:**

```diff
- import { Progress, ProgressCircle } from '@arshad-shah/cynosure-react';
+ import { LinearProgress, CircularProgress } from '@arshad-shah/cynosure-react';

- <Progress value={60} label="Uploading" />
+ <LinearProgress value={60} label="Uploading" aria-label="Uploading" />

- <Progress striped animated />   // removed — replaced by the default gradient/glow treatment
+ <LinearProgress value={60} />

- <ProgressCircle value={75} label="Loading" />
+ <CircularProgress value={75} aria-label="Loading" />
```
