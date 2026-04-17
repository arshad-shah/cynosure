import { afterEach, describe, expect, it } from 'vitest';
import { resolveStorage } from '../storage.js';
import type { StorageAdapter } from '../types.js';

describe('resolveStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('returns a noop adapter when storage is null', () => {
    const adapter = resolveStorage(null);
    adapter.set('k', 'v');
    expect(adapter.get('k')).toBeNull();
  });

  it('passes a custom adapter through unchanged', () => {
    const custom: StorageAdapter = { get: () => 'fixed', set: () => {} };
    expect(resolveStorage(custom)).toBe(custom);
  });

  it('resolves localStorage by name', () => {
    const adapter = resolveStorage('localStorage');
    adapter.set('k', 'v');
    expect(adapter.get('k')).toBe('v');
  });

  it('resolves sessionStorage by name', () => {
    const adapter = resolveStorage('sessionStorage');
    adapter.set('k', 'v');
    expect(adapter.get('k')).toBe('v');
  });

  it('defaults to localStorage when given undefined', () => {
    const adapter = resolveStorage(undefined);
    adapter.set('k', 'v');
    expect(adapter.get('k')).toBe('v');
  });

  it('returns null on get when storage throws', () => {
    const adapter = resolveStorage('localStorage');
    const orig = window.localStorage.getItem.bind(window.localStorage);
    Object.defineProperty(window.localStorage, 'getItem', {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error('blocked');
      },
    });
    try {
      expect(adapter.get('k')).toBeNull();
    } finally {
      Object.defineProperty(window.localStorage, 'getItem', {
        configurable: true,
        writable: true,
        value: orig,
      });
    }
  });

  it('swallows write errors', () => {
    const adapter = resolveStorage('localStorage');
    const orig = window.localStorage.setItem.bind(window.localStorage);
    Object.defineProperty(window.localStorage, 'setItem', {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error('quota');
      },
    });
    try {
      expect(() => adapter.set('k', 'v')).not.toThrow();
    } finally {
      Object.defineProperty(window.localStorage, 'setItem', {
        configurable: true,
        writable: true,
        value: orig,
      });
    }
  });
});
