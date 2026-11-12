# Notice

An inline message about part of the page that stays until it is resolved or dismissed: sync paused, storage almost full, a failed import.

```tsx
<Notice tone="warning" title="Storage almost full" action={<Button size="sm">Manage</Button>} dismissible>
  You have used 95% of your space.
</Notice>;
```

| Prop          | Default                  | Notes                                                                      |
| ------------- | ------------------------ | -------------------------------------------------------------------------- |
| `tone`        | `info`                   | Any tone; sets the tint, title colour and icon                             |
| `variant`     | `soft`                   | `soft` tinted panel; `filled` the tone's solid colour with its text colour |
| `compact`     | `false`                  | Less padding; title and message share one line when they fit               |
| `title`       | –                        | Short, bold first line                                                     |
| `children`    | –                        | Body text                                                                  |
| `action`      | –                        | One or two Buttons; they drop under the text below a width of 26rem        |
| `dismissible` | `false`                  | Close button; hides the Notice unless you pass `onDismiss` and unmount it  |
| `icon`        | the tone's icon          | Another Facet icon, or `null` for none                                     |
| `labels`      | `{ dismiss: "Dismiss" }` | Built-in strings                                                           |
- `role="alert"` for `danger` (announced even when it appears filled), `role="status"` otherwise: content changes are announced, but a status Notice that mounts already filled is usually only read in place. For a passing message that must be announced, use Toast. The icon is decorative.
- Title and body are at least 4.5:1 in every tone and both variants, in light and dark modes; on a fill, the icons are at least 3:1.
- `filled` uses the tone's `--cy-color-on-<tone>` text colour (neutral fills with the ink and writes in the page background).

Tokens: `--cy-notice-radius`, `--cy-notice-padding`, `--cy-notice-compact-padding`, `--cy-notice-soft-mix`.
