import { render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DirectionProvider } from '../DirectionProvider.js';
import { useDirection } from '../hooks/useDirection.js';

beforeEach(() => {
  document.documentElement.removeAttribute('dir');
});

afterEach(() => {
  document.documentElement.removeAttribute('dir');
});

describe('DirectionProvider', () => {
  it('defaults to ltr outside a provider', () => {
    const { result } = renderHook(() => useDirection());
    expect(result.current).toBe('ltr');
  });

  it('sets document dir when scope is "document"', () => {
    render(
      <DirectionProvider dir="rtl">
        <span>hi</span>
      </DirectionProvider>,
    );
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('does not touch document when scope is "subtree"', () => {
    render(
      <DirectionProvider dir="rtl" scope="subtree">
        <span>hi</span>
      </DirectionProvider>,
    );
    expect(document.documentElement.getAttribute('dir')).toBeNull();
  });

  it('exposes direction to descendants via useDirection', () => {
    const { result } = renderHook(() => useDirection(), {
      wrapper: ({ children }) => <DirectionProvider dir="rtl">{children}</DirectionProvider>,
    });
    expect(result.current).toBe('rtl');
  });

  it('restores previous dir on unmount', () => {
    document.documentElement.setAttribute('dir', 'ltr');
    const { unmount } = render(
      <DirectionProvider dir="rtl">
        <span>hi</span>
      </DirectionProvider>,
    );
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    unmount();
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });
});
