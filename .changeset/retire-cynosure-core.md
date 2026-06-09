---
'@arshad-shah/cynosure-react': patch
---

Drop the unused `@arshad-shah/cynosure-core` runtime dependency. The package
never exported anything beyond a `VERSION` constant and was not imported by
any source file in this package — removing the edge stops consumers from
pulling an empty package transitively.

The `@arshad-shah/cynosure-core` package itself has been retired from the
workspace. The npm package will be deprecated separately so existing
installs surface a one-line notice instead of breaking. Headless primitives
(hooks, focus-trap helpers, polymorphic typings) continue to live inside
this package; should a second framework adapter ever materialise, those
will be extracted into a fresh package at that point rather than kept
alive as an empty namespace squat in the interim.
