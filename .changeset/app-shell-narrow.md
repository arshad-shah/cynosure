---
"@arshad-shah/cynosure": minor
---

`AppShell` now shares its narrow state, so products no longer repeat the breakpoint. `useAppShell()` returns `{ narrow }` to anything rendered inside the shell (it is `false` on the server, on the first client render and outside a shell), and the new `onNarrowChange` prop tells code outside the shell once per change.
