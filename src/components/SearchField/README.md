# SearchField

A `TextField` preset for search: `role="searchbox"`, the Facet `search` icon, clearable by default, Enter calls `onSubmit(value)` (ignored during IME composition), Escape clears and a second Escape blurs.

```tsx
<SearchField label="Search documents" onSubmit={runSearch} onChange={setQuery} />;
```

All `TextField` props apply except `type` and `iconStart`.
