---
"@arshad-shah/cynosure": minor
---

`Stack` takes `direction` (`"column"`, the default, or `"row"`), and its `align` accepts `"baseline"`. `Inline` is now a Stack in a row: it renders Stack with `direction="row"` and keeps its own centring and `wrap` in the new `styles/inline.css` (Inline's rules used to live in `styles/stack.css`). Load both stylesheets for Inline when you import them one by one. Inline's props and look are unchanged.
