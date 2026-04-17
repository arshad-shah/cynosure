import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorage, useSessionStorage } from '../useStorage.js';

describe('useLocalStorage', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it('reads the initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'seed'));
    expect(result.current[0]).toBe('seed');
  });

  it('writes and persists JSON values', () => {
    const { result } = renderHook(() => useLocalStorage('k', { count: 0 }));
    act(() => result.current[1]({ count: 1 }));
    expect(result.current[0]).toEqual({ count: 1 });
    expect(JSON.parse(window.localStorage.getItem('k') ?? 'null')).toEqual({ count: 1 });
  });

  it('removes the key and resets to initial', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'seed'));
    act(() => result.current[1]('changed'));
    act(() => result.current[2]());
    expect(result.current[0]).toBe('seed');
    expect(window.localStorage.getItem('k')).toBeNull();
  });
});

describe('useSessionStorage', () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => window.sessionStorage.clear());

  it('persists to sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorage('k', 1));
    act(() => result.current[1](2));
    expect(window.sessionStorage.getItem('k')).toBe('2');
  });
});

describe('useLocalStorage extras', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it('hydrates from an existing stored value', () => {
    window.localStorage.setItem('k', JSON.stringify({ a: 1 }));
    const { result } = renderHook(() => useLocalStorage<{ a: number }>('k', { a: 0 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('returns the lazy initial value when storage is empty', () => {
    const init = vi.fn(() => 'lazy');
    const { result } = renderHook(() => useLocalStorage('lazyKey', init));
    expect(result.current[0]).toBe('lazy');
    expect(init).toHaveBeenCalled();
  });

  it('falls back to initial when stored data is malformed', () => {
    window.localStorage.setItem('k', '{not json');
    const { result } = renderHook(() => useLocalStorage('k', 'seed'));
    expect(result.current[0]).toBe('seed');
  });

  it('supports an updater function', () => {
    const { result } = renderHook(() => useLocalStorage('k', 1));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
  });

  it('responds to cross-tab storage events', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'seed'));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'k',
          newValue: JSON.stringify('updated'),
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe('updated');
  });

  it('resets to initial when storage event reports key removal', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'seed'));
    act(() => result.current[1]('changed'));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'k',
          newValue: null,
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe('seed');
  });

  it('ignores storage events with malformed payloads', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'seed'));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'k',
          newValue: '{not json',
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe('seed');
  });

  it('skips storage events for unrelated keys', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'seed'));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'other',
          newValue: '"x"',
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe('seed');
  });

  it('does not subscribe when syncAcrossTabs is false', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'seed', { syncAcrossTabs: false }));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'k',
          newValue: '"updated"',
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe('seed');
  });
});
