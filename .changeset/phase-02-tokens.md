---
'@lumen/tokens': minor
---

Initial token pipeline: DTCG primitives + semantic layers (colors, spacing,
typography, radii, shadows, motion, z-index), a Style Dictionary v4 build
that emits `dist/css/base.css`, `dist/css/dark.css`, and typed TS constants,
plus an Ajv-backed JSON Schema validator. CSS uses `var(--lumen-*)` aliases
so theming overrides cascade; dark theme carries only the semantic overrides.
