# docs

- `PROGRESS.md`: the resumable status. Update it at the end of every session; `pnpm cy progress` validates its sections.
- Guides: `architecture`, `conventions`, `theming`, `icons`, `accessibility`, `without-react`, `code-editors`, `testing`, `adapters`, `release`, `migration`. The public ones are pages on the documentation site; `site/docs.config.ts` lists those kept out (`exclude`) and their order.
- `superpowers/specs` (design) and `superpowers/plans` (implementation plans). Plans are executed task by task; never rewrite a completed plan, write the next one.
