import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { vars } from '../vars.css.js';

/**
 * The `vars` contract is generated from the published token tree, and this test
 * is the guard that it stays a faithful, complete mirror of the *emitted* token
 * CSS. It compares the custom-property names the contract produces against the
 * names Style Dictionary writes to `base.css`. It fails if:
 *   - the contract is missing a token (the historical drift — 102 names),
 *   - the contract types a name the CSS doesn't define, or
 *   - the shared `toCssName` mapper ever diverges from SD's `name/kebab`.
 */

/** Every `--cynosure-*` name referenced by the contract's `var(--…)` leaves. */
function contractVarNames(): Set<string> {
  const names = new Set<string>();
  const walk = (node: unknown): void => {
    if (typeof node === 'string') {
      const m = node.match(/^var\((--[a-z0-9-]+)\)$/);
      if (m) names.add(m[1]);
      return;
    }
    if (node && typeof node === 'object') {
      for (const value of Object.values(node)) walk(value);
    }
  };
  walk(vars);
  return names;
}

/** Every `--cynosure-*` name *defined* in the generated `base.css`. */
function cssVarNames(): Set<string> {
  const require = createRequire(import.meta.url);
  const pkg = require.resolve('@arshad-shah/cynosure-tokens/package.json');
  const baseCss = join(dirname(pkg), 'dist', 'css', 'base.css');
  if (!existsSync(baseCss)) {
    throw new Error(
      `Tokens not built — expected ${baseCss}. Run \`pnpm --filter @arshad-shah/cynosure-tokens build\`.`,
    );
  }
  const css = readFileSync(baseCss, 'utf8');
  return new Set([...css.matchAll(/(--cynosure-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
}

describe('vars ↔ tokens parity', () => {
  it('types exactly the custom properties the tokens package emits', () => {
    const contract = contractVarNames();
    const css = cssVarNames();

    const missingFromContract = [...css].filter((n) => !contract.has(n)).sort();
    const extraInContract = [...contract].filter((n) => !css.has(n)).sort();

    expect({ missingFromContract, extraInContract }).toEqual({
      missingFromContract: [],
      extraInContract: [],
    });
  });
});
