# CopyButton

An IconButton that copies a value to the clipboard, shows a check (or an error) for a moment and announces the result.

```tsx
<CopyButton value={installCommand} />
<CopyButton value={() => editor.getValue()} labels={{ copy: "Copy code" }} />
```

| Prop                                              | Default                                                        | Notes                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `value`                                           | –                                                              | Text, or a function called at click time                               |
| `copy`                                            | `navigator.clipboard.writeText`                                | Inject your own writer (extensions, tests); a throw or rejection fails |
| `labels`                                          | `{ copy: "Copy", copied: "Copied", failed: "Could not copy" }` | Name, tooltip and announcement                                         |
| `timeout`                                         | `2000`                                                         | Milliseconds before it returns to the copy state                       |
| `onCopy` / `onError`                              | –                                                              | Called with the text, or with the error                                |
| `size`, `variant`, `disabled`, `tooltipPlacement` | `md`, `ghost`                                                  | As IconButton                                                          |
- Never throws: a missing clipboard (insecure context, some extension pages), a refused permission or a throwing writer all show the failed state.
- The result is announced through a live `role="status"` that exists before the click; the button's name changes with it.
