import { renderHook } from '@testing-library/react';
import { type RefObject, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useMutationObserver } from '../useMutationObserver.js';

describe('useMutationObserver', () => {
  it('fires the callback when attributes change', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const cb = vi.fn();
    renderHook(() => {
      const ref = useRef(el) as RefObject<HTMLDivElement | null>;
      return useMutationObserver(ref, cb, { attributes: true });
    });

    el.setAttribute('data-x', '1');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(cb).toHaveBeenCalled();

    document.body.removeChild(el);
  });
});
