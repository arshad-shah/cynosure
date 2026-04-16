import { describe, expect, it } from 'vitest';
import { cn } from '../cn.js';

describe('cn', () => {
  it('joins string inputs with a single space', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values', () => {
    expect(cn('a', null, undefined, false, 0, '', 'b')).toBe('a b');
  });

  it('flattens nested arrays', () => {
    expect(cn('a', ['b', ['c', null, ['d']]])).toBe('a b c d');
  });

  it('returns an empty string with no inputs', () => {
    expect(cn()).toBe('');
  });

  it('coerces numbers to strings', () => {
    expect(cn(1, 'a', 2)).toBe('1 a 2');
  });
});
