# Announcer

Screen reader announcements for things that happen without a focus change: "Draft saved", "3 results", "Could not save". `<Announcer>` renders two hidden live regions where you put it (inside your app, never in `<body>`), and `useAnnounce()` speaks through the nearest one.

```tsx
import { Announcer, useAnnounce } from "@arshad-shah/cynosure";

<CynosureTheme>
  <Announcer>
    <App />
  </Announcer>
</CynosureTheme>;

function SaveButton() {
  const announce = useAnnounce();
  return (
    <Button
      onClick={async () => {
        await save();
        announce("Draft saved");
      }}
    >
      Save
    </Button>
  );
}
```

| API                             | Notes                                                                  |
| ------------------------------- | ---------------------------------------------------------------------- |
| `<Announcer clearAfter={5000}>` | Render once near the root. Messages clear after `clearAfter` ms        |
| `useAnnounce()`                 | Returns `announce(message, { politeness })`                            |
| `politeness`                    | `polite` (default) waits its turn; `assertive` interrupts: errors only |
- The same message twice is read twice (each announcement is a new node).
- Without an `<Announcer>` above it, `announce` does nothing and warns once in the console.
- Toasts and Notices already announce themselves; use this for changes that have no visible message, or a message elsewhere on the page.

## Tokens

None: the regions are never seen.
