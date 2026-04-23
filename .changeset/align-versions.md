---
'@arshad-shah/cynosure-cli': patch
'@arshad-shah/cynosure-core': patch
'@arshad-shah/cynosure-icons': patch
'@arshad-shah/cynosure-react': patch
'@arshad-shah/cynosure-themes': patch
'@arshad-shah/cynosure-tokens': patch
---

Realign all public packages to a single shared version. Prior releases drifted because `linked` only bumps packages that are co-authored in the same changeset or connected via the internal dependency graph. Switching to `fixed` in `.changeset/config.json` enforces lockstep versioning from this release forward.
