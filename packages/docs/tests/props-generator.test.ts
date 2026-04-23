import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractProps } from '../scripts/generate-props';

const REACT_TSCONFIG = resolve(__dirname, '../../react/tsconfig.json');
const REACT_SRC = resolve(__dirname, '../../react/src');

describe('extractProps', () => {
  it('returns an entry for Button with expected prop fields', () => {
    const result = extractProps({ tsconfigPath: REACT_TSCONFIG, sourceRoot: REACT_SRC });
    const btn = result.Button;
    if (!btn) throw new Error('Button not found in extractProps result');
    expect(Array.isArray(btn.props)).toBe(true);
    const names = btn.props.map((p) => p.name);
    expect(names).toContain('variant');
    expect(names).toContain('size');
    for (const p of btn.props) {
      expect(typeof p.name).toBe('string');
      expect(typeof p.type).toBe('string');
      expect(typeof p.required).toBe('boolean');
    }
    // react-docgen-typescript parses the full react tsconfig graph (~300+
    // components on this branch) — give it enough headroom on slow CI runners.
  }, 240_000);
});
