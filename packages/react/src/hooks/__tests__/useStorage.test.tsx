import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
