---
"@arshad-shah/cynosure": minor
---

CodeBlock: `tokenize` takes a product's own tokenizer, returning the code as `{ text, kind }` stretches (`SyntaxKind`: comment, keyword, string, number, function, type, variable, property, operator, punctuation, tag, attribute, regexp). Each kind is coloured with the palette's `--cy-color-syntax-*` token, readable on the code's background in every palette, so no product CSS is needed. `SyntaxKind` and `SyntaxToken` are exported.
