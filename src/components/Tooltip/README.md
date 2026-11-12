# Tooltip

Short supplementary text for a control, rendered in the top layer (Popover API) so it is never clipped and works inside shadow roots. It becomes the trigger's accessible description.

```tsx
<Tooltip content="Download as JSON">
  <Button icon={download}>Export</Button>
</Tooltip>;
```

| Prop        | Default | Notes                                                                                 |
| ----------- | ------- | ------------------------------------------------------------------------------------- |
| `content`   | –       | Short text (not interactive content)                                                  |
| `children`  | –       | One focusable element                                                                 |
| `placement` | `top`   | `top` · `bottom` · `start` · `end`; flips and shifts to stay visible                  |
| `delay`     | `300`   | Hover delay in ms; keyboard focus opens immediately                                   |
| `className` | –       | Added to the anchor around the trigger (the box its parent lays out), for layout only |
| `disabled`  | `false` | Never opens and describes nothing; the trigger stays mounted (a label cut short only) |

Behaviour (WCAG 1.4.13): hoverable, dismissible with Escape, stays while hovered or focused, never opens on touch. Follows its trigger on scroll and resize.

## Tokens

- `--cy-tooltip-{bg,ink,radius,max-width}`
