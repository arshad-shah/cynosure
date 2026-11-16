# VideoBase (foundation)

The only module that renders a native `<video>`: a live `MediaStream` (a camera's) set as its `srcObject`, muted and played inline (so phones neither ask for sound nor go full screen), started as soon as it is set, with no controls and no picture-in-picture. Named with `aria-label`.

```tsx
<VideoBase label="Camera" stream={stream} className="my-video" />;
```

| Prop                  | Default | Notes                           |
| --------------------- | ------- | ------------------------------- |
| `label`               | –       | The picture's accessible name   |
| `stream`              | –       | A MediaStream, or null for none |
| `className` / `style` | –       | Layout only                     |

No visual opinions: composites style it. Used by CameraView.
