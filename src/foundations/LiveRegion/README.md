# LiveRegion (foundation)

A hidden live region: screen readers announce what it holds whenever that changes. Every component that announces something of its own (a copy, a move, a zoom level, a match count) renders one instead of writing `role="status"` by hand; `Announcer` renders two (`cy check` flags a hand-written hidden live region).

```tsx
import { LiveRegion, useLiveMessage } from "@arshad-shah/cynosure";

const [message, say] = useLiveMessage();
say("Copied"); // said again even when it was the last message
<LiveRegion {...message} />

<LiveRegion>{`${count} results`}</LiveRegion> // follows a value: speaks when the words change
```

| Prop         | Default  | Notes                                                            |
| ------------ | -------- | ---------------------------------------------------------------- |
| `children`   | –        | Text or elements (a `Kbd`); `""`, null or false says nothing     |
| `sequence`   | `0`      | A new number re-reads the same words (`useLiveMessage` gives it) |
| `politeness` | `polite` | `polite` (`role="status"`) · `assertive` (`role="alert"`)        |
| `className`  | –        | The owning component's own class                                 |

`useLiveMessage()` returns `[message, say]`: `say(words)` announces, `say("")` clears silently.

No visual opinions: it is always out of sight (`.cy-visually-hidden`) and always in the page, so the first message is heard.
