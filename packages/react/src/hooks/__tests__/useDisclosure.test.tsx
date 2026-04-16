import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDisclosure } from '../useDisclosure.js';

describe('useDisclosure', () => {
  it('starts closed by default and toggles between states', () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.onOpen());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.onClose());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.onToggle());
    expect(result.current.isOpen).toBe(true);
  });

  it('honours defaultOpen', () => {
    const { result } = renderHook(() => useDisclosure({ defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  it('calls onOpenChange in both controlled and uncontrolled modes', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDisclosure({ onOpenChange }));
    act(() => result.current.onOpen());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
