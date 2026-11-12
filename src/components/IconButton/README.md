# IconButton

A square `Button` with only an icon. `label` is required: it is the accessible name and the tooltip text. No native `title` tooltip.

```tsx
<IconButton icon={copy} label="Copy document" onClick={copyDoc} />;
```

The tooltip opens on hover and keyboard focus and closes on Escape, blur or pointer leave. All `Button` props and tokens apply (except `children`, `iconEnd`, `fullWidth` and `square`, which it sets).

| Prop               | Default | Notes                                                                                                       |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------------------- |
| `flipRtl`          | `false` | The icon points along the reading direction (previous, next): mirrored in right-to-left text                |
| `iconColor`        | –       | Any CSS colour for the icon (a status shown for a moment, as CopyButton does)                               |
| `wrapperClassName` | –       | Added to the element around the button (the tooltip's anchor, the box the parent lays out), for layout only |
| `className`        | –       | Added to the button itself, for layout only                                                                 |

`aria-current` (for example `"page"`) is set on the element whether it is a button or, with `href`, a link.
