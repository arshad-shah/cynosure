---
"@arshad-shah/cynosure": minor
---

The default changed: `Dialog` and `Sheet` no longer keep their content mounted while closed; pass the new `keepMounted` prop to keep the old behaviour. The content now mounts when the dialog opens and unmounts once its closing transition has ended (at once under reduced motion), so every opening starts with fresh state, a closed dialog renders an empty `<dialog>` element (on the server too), and tests can no longer find the content of a closed dialog. Use `keepMounted` for content whose state must survive closing or that is expensive to rebuild. This also applies to what is built on them: `ProgressOverlay`, and the navigation drawer of `AppShell`.
