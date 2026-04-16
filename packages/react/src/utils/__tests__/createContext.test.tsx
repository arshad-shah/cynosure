import { render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createContext } from '../createContext.js';

describe('createContext', () => {
  it('throws a helpful error when the hook is used outside the provider', () => {
    const [, useValue] = createContext<string>('FooProvider');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useValue())).toThrow(
      /`useFoo` must be used within a `FooProvider`\./,
    );
    spy.mockRestore();
  });

  it('returns the provided value inside a provider', () => {
    const [Provider, useValue] = createContext<string>('BarProvider');
    const { result } = renderHook(() => useValue(), {
      wrapper: ({ children }) => <Provider value="hello">{children}</Provider>,
    });
    expect(result.current).toBe('hello');
  });

  it('respects an explicit fallback instead of throwing', () => {
    const [, useValue] = createContext<number>('QuxProvider', { fallback: 42 });
    const { result } = renderHook(() => useValue());
    expect(result.current).toBe(42);
  });

  it('renders children as a React element', () => {
    const [Provider] = createContext<string>('RenderProvider');
    const { getByText } = render(<Provider value="x">hi</Provider>);
    expect(getByText('hi')).toBeInTheDocument();
  });
});
