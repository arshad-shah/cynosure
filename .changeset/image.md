---
"@arshad-shah/cynosure": minor
---

New `Image` component: a picture that never shifts the layout. `ratio` reserves its space with AspectRatio (or `width` and `height` do), a Skeleton shows while it loads, and a quiet box with the image icon and the `alt` text takes its place when it fails; `placeholder` and `fallback` replace either. It also has `fit`, `position`, `radius`, lazy loading by default, a `caption` that makes a named `figure`, and it notices a picture that had already loaded before React attached.
