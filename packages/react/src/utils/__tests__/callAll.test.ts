import { describe, expect, it, vi } from 'vitest';
import { callAll } from '../callAll.js';

describe('callAll', () => {
  it('invokes every function with the same args in order', () => {
    const calls: string[] = [];
    const a = vi.fn((_s: string, _n: number) => {
      calls.push('a');
    });
    const b = vi.fn((_s: string, _n: number) => {
      calls.push('b');
    });
    callAll<[string, number]>(a, b)('x', 1);
    expect(a).toHaveBeenCalledWith('x', 1);
    expect(b).toHaveBeenCalledWith('x', 1);
    expect(calls).toEqual(['a', 'b']);
  });

  it('skips null/undefined entries', () => {
    const a = vi.fn();
    callAll(null, undefined, a)('hi');
    expect(a).toHaveBeenCalledWith('hi');
  });
});
