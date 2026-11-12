# SearchField

A `TextField` preset for search: `role="searchbox"`, the Facet `search` icon, clearable by default, Enter calls `onSubmit(value)` (ignored during IME composition), Escape clears and a second Escape blurs.

```tsx
<SearchField label="Search documents" onSubmit={runSearch} onChange={setQuery} />;
```

All `TextField` props apply except `type` and `iconStart`.

`trailing` puts status text inside the field's end, such as a match count. The visible text is hidden from assistive technology and a polite live region (always in the page) reads each new text once:

```tsx
<SearchField
  label="Find"
  value={query}
  onChange={setQuery}
  trailing={query ? `${at} of ${total}` : undefined}
/>;
```

It is for text; controls go in `addonEnd`, after it.

## Tokens

- `--cy-search-field-trailing-color`: colour of the trailing status text
- `--cy-search-field-trailing-font-size`: font size of the trailing status text (a match count)
