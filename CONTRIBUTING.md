# Contributing to Cynosure

Thanks for your interest in contributing. Cynosure is built in small, disciplined
increments and everything ships with a decision log, so new contributors can
move with the same grain as the existing codebase.

---

## Prerequisites

| Tool    | Version          | Notes                                                    |
| ------- | ---------------- | -------------------------------------------------------- |
| Node    | `>=22.0.0`       | `engines.node` enforces this. Use Volta / fnm / nvm.     |
| pnpm    | `10.33.0`        | `packageManager` is pinned — do not bump casually.       |
| Git     | recent           |                                                          |

Install dependencies:

```bash
pnpm install
```

---

## Daily loop

```bash
# Build every package (Turbo-cached)
pnpm build

# Run the Storybook dev server
pnpm storybook

# Unit tests (Vitest, jsdom by default)
pnpm test

# Cross-browser tests (Playwright, opt-in)
CYNOSURE_BROWSER_MODE=1 pnpm test

# Lint + format
pnpm lint
pnpm lint:fix

# Type-check the whole workspace
pnpm typecheck

# Size budgets + quality audits
pnpm size
pnpm audit
```

---

## How the repo is organised

```
cynosure/
├── packages/
│   ├── react/     @arshad-shah/cynosure-react — main component library
│   ├── tokens/    @arshad-shah/cynosure-tokens — DTCG tokens + CSS + TS
│   ├── themes/    @arshad-shah/cynosure-themes — prebuilt alternative themes
│   ├── core/      @arshad-shah/cynosure-core — framework-agnostic primitives
│   ├── icons/     @arshad-shah/cynosure-icons — Lucide re-exports
│   └── config/    internal — shared tsconfig/tsup/biome presets
├── docs/
│   ├── foundations/     public-facing foundations (MDX)
│   ├── recipes/         public-facing recipes (MDX)
│   └── specs/           internal build specification
│       ├── ARCHITECTURE.md     the seven laws, styling pipeline
│       ├── PROGRESS.md         single source of truth for phase state
│       └── phases/             per-phase build docs (01–16)
└── scripts/         maintenance scripts (audits, changelog, …)
```

---

## The phase-based workflow

Cynosure is built across 16 phases (see `docs/specs/phases/`). Each phase has:

- A spec document.
- Explicit exit criteria.
- A row in `docs/specs/PROGRESS.md` that is the single source of truth for
  status.

If you are contributing a new component or behaviour, confirm with the
maintainer which phase it belongs in. New work generally lands inside an
existing phase or as a patch on top of v1.

**Rules while working inside a phase:**

1. Read the phase doc before writing code.
2. Do not implement work that belongs in a later phase.
3. Commit in small, atomic chunks — each commit passes `lint + typecheck +
   test`.
4. Prefix commits with the phase number: `feat(phase-05): add Stack primitive`.
5. Write a [changeset](https://github.com/changesets/changesets) for every
   user-facing change: `pnpm changeset`.
6. Append the commit to `docs/specs/PROGRESS.md` → "Change log".
7. If a decision is non-obvious, record it in `PROGRESS.md` → "Decisions log".

---

## Component anatomy

Every component lives at
`packages/react/src/<category>/<ComponentName>/` and contains at minimum:

```
<ComponentName>.tsx          # component
<ComponentName>.css.ts       # vanilla-extract recipe
<ComponentName>.stories.tsx  # Storybook stories (with a11y addon)
<ComponentName>.test.tsx     # Vitest tests (browser-mode-ready)
index.ts                     # re-exports
```

Optional:

- `<ComponentName>.mdx` — docs page (required for every public component by
  phase 15).
- `<ComponentName>.types.ts` — if the public type surface is large.

Match existing neighbours for style.

---

## Commit conventions

Commits follow a loose Conventional-Commits style, enforced by
`scripts/verify-commit-msg.mjs` at commit time:

```
feat(phase-07): add Button loading state
fix(phase-11): ScrollArea viewport display override
chore: bump turbo to 2.9.7
docs(recipes): add notification-center recipe
```

- One semantic commit per logical change.
- Prefer new commits over `--amend`. Amending skips hooks and surprises CI.

---

## Pull requests

1. Branch from `main` (or the phase branch the maintainer points you at).
2. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` before
   pushing.
3. Include a changeset if your change is user-facing.
4. Link the relevant phase doc section in the PR description.
5. Chromatic will render a preview; please eyeball the diffs before requesting
   review.

---

## Security

If you find a security issue, **do not open a public issue**. Follow the
disclosure process in [`SECURITY.md`](./SECURITY.md).

---

## Code of conduct

All participants are expected to uphold the
[Contributor Covenant](./CODE_OF_CONDUCT.md).

---

Thank you for helping build Cynosure.
