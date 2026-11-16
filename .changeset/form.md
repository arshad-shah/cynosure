---
"@arshad-shah/cynosure": minor
---

New `Form`: a group of fields that submits as one. Enter in any text field submits it (also with several fields and no submit button), after the fields' validation; `onSubmit(values, event)` receives `FormData` and the page does not navigate. `label` names it as a form landmark, `gap` spaces the fields, native form attributes pass through. Token `--cy-form-gap`.
