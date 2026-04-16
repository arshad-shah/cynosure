import { fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useFocusTrap } from '../useFocusTrap.js';

function TrappedPanel() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  return (
    <div ref={ref} data-testid="panel">
      <button type="button">one</button>
      <button type="button">two</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('focuses the first focusable descendant on mount', () => {
    render(<TrappedPanel />);
    const first = document.querySelectorAll('button')[0];
    expect(document.activeElement).toBe(first);
  });

  it('wraps focus when tabbing past the last element', () => {
    render(<TrappedPanel />);
    const buttons = document.querySelectorAll('button');
    const first = buttons[0] as HTMLButtonElement;
    const last = buttons[1] as HTMLButtonElement;
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  it('wraps focus backward with shift+tab on the first element', () => {
    render(<TrappedPanel />);
    const buttons = document.querySelectorAll('button');
    const first = buttons[0] as HTMLButtonElement;
    const last = buttons[1] as HTMLButtonElement;
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});
