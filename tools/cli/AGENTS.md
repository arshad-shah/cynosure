# tools/cli (`cy`)

Built on `@arshad-shah/clif`. Commands live in `index.ts`; logic lives in pure, tested functions in `lib/` (`check.ts`, `scaffold.ts`, `progress.ts`).

- Every new convention becomes a rule in `lib/check.ts` with a test in `tests/unit/cli/cli.test.ts` that fails on a violating fixture in a sandbox copy of the repo.
- Generators are deterministic and refuse to overwrite. Generated code contains `TODO(cy)` markers that `cy check` reports until replaced.
- Never make `cy check` lenient to get a commit through; fix the code.
