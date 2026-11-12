# IconButton

A square `Button` with only an icon. `label` is required: it is the accessible name and the tooltip text. No native `title` tooltip.

```tsx
<IconButton icon={copy} label="Copy document" onClick={copyDoc} />;
```

The tooltip opens on hover and keyboard focus and closes on Escape, blur or pointer leave. All `Button` props and tokens apply (except `children`, `iconEnd` and `fullWidth`).

`aria-current` (for example `"page"`) is set on the element whether it is a button or, with `href`, a link.
