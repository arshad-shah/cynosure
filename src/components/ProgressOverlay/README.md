# ProgressOverlay

Modal progress for long work the page has to wait for (exporting, compressing, converting): a Dialog with a ProgressBar and a status line read out as it changes. Escape and Cancel call `onCancel`; without `onCancel` it cannot be closed and stays until the work ends.

```tsx
import { ProgressOverlay } from "@arshad-shah/cynosure";

<ProgressOverlay open={running} title="Compressing the PDF" value={page} max={pages} onCancel={stop} />;
```

| Prop                  | Default | Notes                                                    |
| --------------------- | ------- | -------------------------------------------------------- |
| `open`, `title`       | –       | The title names the dialog and the bar                   |
| `value` / `max`       | –, 100  | Leave `value` undefined while the amount is unknown      |
| `status`              | –       | The line under the bar; default "3 of 12", or "Working…" |
| `onCancel`            | –       | Cancel button and Escape; omit to make it uncancellable  |
| `labels`              | –       | `cancel`, `working`, `count(value, max)`                 |
| `className` / `style` | –       | Layout only                                              |

Built from Dialog, ProgressBar and Button: focus moves in, stays in, and returns to where it was when the overlay closes.

## Tokens

None of its own: it uses the Dialog and ProgressBar tokens.
