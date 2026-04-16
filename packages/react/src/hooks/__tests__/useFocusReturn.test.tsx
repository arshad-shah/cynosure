import { render } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { useFocusReturn } from '../useFocusReturn.js';

function TrappedDialog({ onMount }: { onMount?: () => void }) {
  useFocusReturn(true);
  useEffect(() => {
    onMount?.();
  }, [onMount]);
  return <button type="button">inside</button>;
}

describe('useFocusReturn', () => {
  it('restores focus to the previously focused element on unmount', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'trigger';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = render(<TrappedDialog />);
    // simulate focus moving inside the dialog
    const insideButton = document.querySelector('button:not([tabindex])');
    (insideButton as HTMLElement | null)?.focus();

    unmount();
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
