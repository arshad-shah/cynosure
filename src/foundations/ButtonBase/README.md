# ButtonBase (foundation)

The only module allowed to render a native `<button>`. Every Cynosure component that needs a button uses `Button`, `IconButton`, or (for unusual composites) `ButtonBase`.

- `type` defaults to `"button"`.
- `pressed` maps to `aria-pressed` and `data-pressed`.
- No styling: `Button` and other components add classes.

## Used by

Button, IconButton, and every composite with a clickable control.
