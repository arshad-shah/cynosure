# Notice

An inline message about part of the page that stays until it is resolved or dismissed: sync paused, storage almost full, a failed import.

```tsx
<Notice tone="warning" title="Storage almost full" action={<Button size="sm">Manage</Button>} dismissible>
  You have used 95% of your space.
</Notice>;
```

| Prop          | Default                  | Notes                                                                     |
| ------------- | ------------------------ | ------------------------------------------------------------------------- |
| `tone`        | `info`                   | Any tone; sets the tint, title colour and icon                            |
| `title`       | –                        | Short, bold first line                                                    |
| `children`    | –                        | Body text                                                                 |
| `action`      | –                        | One or two Buttons; they drop under the text below a width of 26rem       |
| `dismissible` | `false`                  | Close button; hides the Notice unless you pass `onDismiss` and unmount it |
| `icon`        | the tone's icon          | Another Facet icon, or `null` for none                                    |
| `labels`      | `{ dismiss: "Dismiss" }` | Built-in strings                                                          |
- `role="alert"` for `danger` (announced even when it appears filled), `role="status"` otherwise: content changes are announced, but a status Notice that mounts already filled is usually only read in place. For a passing message that must be announced, use Toast. The icon is decorative.
- Title and body are at least 4.5:1 in every tone, in light and dark modes.

Tokens: `--cy-notice-radius`, `--cy-notice-padding`, `--cy-notice-soft-mix`.

## Used by

Prism (sync and permission warnings), Aperture (capture errors), web apps (account and billing banners).
