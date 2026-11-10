# Cynosure: agent rules

Cynosure is **one** small, themeable, accessible UI package (`@arshad-shah/cynosure`) used by every Arshad Shah product: extensions, web apps and Astro sites. Products never build their own UI components; they import Cynosure and adjust tokens.

Read before working: `docs/PROGRESS.md` (where we are), `docs/architecture.md`, `docs/conventions.md`, and the `AGENTS.md` in the folder you are touching. The design and plans are in `docs/superpowers/`.

## Setup and commands

Node 24 (`.nvmrc`), pnpm via `packageManager` (installs refuse versions younger than 14 days).

| Command                                                     | What it does                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm install`                                              | Install; also sets the worktree's git hooks (`.githooks`)                          |
| `pnpm storybook`                                            | Workbench at http://localhost:6006 (theme, scale, accent and hostile-host toolbar) |
| `pnpm test`                                                 | Unit tests (tokens, CLI, Preact compat)                                            |
| `pnpm test:stories`                                         | Every story as a browser test on Chromium, Firefox, WebKit, plus the touch project |
| `pnpm check`                                                | `cy check`: every convention rule (must be clean)                                  |
| `pnpm lint` / `pnpm typecheck` / `pnpm build` / `pnpm size` | Gates                                                                              |
| `pnpm verify`                                               | All gates in order. Run before pushing.                                            |
| `pnpm cy new component <Name> --kind composite\|foundation` | Scaffold a component (never hand-create one)                                       |
| `pnpm cy new icon <name> --from file.svg`                   | Add a Facet icon                                                                   |
| `pnpm cy new token <component.token> --doc "…"`             | Add a component token                                                              |
| `pnpm cy progress`                                          | Print the current task and next step                                               |

## Non-negotiable rules

1. **Native interactive elements only in `src/foundations/`.** Composites use `Button`, `IconButton`, `TextField`… never `<button>`, `<a>`, `<input>`, `<select>`, `<details>`, `<dialog>`. Once a component exists, every other component reuses it.
2. **No `title=`, no text or emoji glyphs as icons.** Icons are Facet SVGs via `<Icon>`.
3. **Every visual value is a token.** Component CSS reads `--cy-<component>-*` with a global `--cy-*` fallback. No hex or px literals outside `var()` fallbacks.
4. **Isolation.** Never write to `<html>`, `<head>` or `<body>` (except `CynosureTheme target="document"`). No inline `<script>`, no runtime style injection, no CSS imported from JS. Component roots never carry `.cy-reset`; they declare their own reset properties.
5. **Behavioural tests only.** Every story has play tests that fail when the behaviour breaks: pointer, keyboard, touch, focus, values, disabled, a11y, hostile host. No "renders" or snapshot-only tests. Write the failing test first.
6. **Touch and a11y.** Hit area ≥ 24px always, ≥ 44px on coarse pointers. WAI-ARIA APG patterns. Built-in strings are English and overridable through a typed `labels` prop.
7. **One runtime dependency: `@arshad-shah/detent`** (Arshad's own zero-dependency drag, reorder and resize library) for pointer dragging; use it instead of hand-written drag code. Ask before adding any other.
8. **Docs move with code.** Every component has a README with `## Used by`; every folder rule lives in that folder's `AGENTS.md`.

## Git, branches and publishing

- Work on branch `next`. Commits are conventional (`feat(button): …`) and carry **no AI attribution** (no Co-Authored-By or "Generated with" lines).
- Push with the personal account: `gh auth switch -h github.com -u arshad-shah`, `git push`, then `gh auth switch -h github.com -u ShahA_hmh`.
- **Never** publish to npm, deprecate the old `cynosure-*` packages or merge to `main` without Arshad's explicit go-ahead.
- Storybook deploys to GitHub Pages on every push to `next`: https://arshad-shah.github.io/cynosure/

## End of every session

Update `docs/PROGRESS.md` (status, current task, next step, decisions, verification), run `pnpm verify`, commit, push. Another machine or agent must be able to resume from `PROGRESS.md` alone.
