---
'@arshad-shah/cynosure-react': major
---

Remove `Banner`, `BannerContent`, and `BannerActions`. Banner duplicated `Alert` —
same status surface recipe, same dismissal model, same content/actions slots — and
the dual API created confusion about which to reach for. Migrate to `Alert` (with
`AlertTitle` / `AlertDescription`); for the full-bleed look, wrap an `Alert` in a
container with `border-radius: 0` and full width.

The `@arshad-shah/cynosure-react/banner` subpath export and the
`clearBannerDismissal` helper are also removed.
