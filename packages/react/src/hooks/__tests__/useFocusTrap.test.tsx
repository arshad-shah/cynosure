import { fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useFocusTrap } from '../useFocusTrap.js';

function TrappedPanel({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, enabled);
  return (
    <div ref={ref} data-testid="panel">
      <button type="button">one</button>
      <button type="button">two</button>
    </div>
  );
}

function EmptyTrappedPanel() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  return <div ref={ref} tabIndex={-1} data-testid="empty-panel" />;
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

  it('does nothing when disabled', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'outside';
    document.body.appendChild(trigger);
    trigger.focus();

    render(<TrappedPanel enabled={false} />);

    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });

  it('ignores non-Tab keys', () => {
    render(<TrappedPanel />);
    const first = document.querySelectorAll('button')[0] as HTMLButtonElement;
    first.focus();
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(document.activeElement).toBe(first);
  });

  it('focuses the container itself when there are no focusable descendants', () => {
    render(<EmptyTrappedPanel />);
    const panel = document.querySelector('[data-testid="empty-panel"]') as HTMLDivElement;
    expect(document.activeElement).toBe(panel);

    // Tabbing with nothing focusable inside should keep focus on the container.
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(panel);
  });

  it('skips focusable descendants with display:none', () => {
    function PanelWithDisplayNone() {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, true);
      return (
        <div ref={ref} data-testid="panel">
          <button type="button" style={{ display: 'none' }}>
            hidden-display
          </button>
          <button type="button">visible</button>
        </div>
      );
    }
    render(<PanelWithDisplayNone />);
    const visible = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'visible',
    ) as HTMLButtonElement;
    expect(document.activeElement).toBe(visible);
  });

  it('skips hidden focusable descendants', () => {
    function PanelWithHidden() {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, true);
      return (
        <div ref={ref} data-testid="panel">
          <button type="button" hidden>
            hidden
          </button>
          <button type="button">visible</button>
        </div>
      );
    }
    render(<PanelWithHidden />);
    const visible = Array.from(document.querySelectorAll('button')).find(
      (b) => !b.hasAttribute('hidden'),
    ) as HTMLButtonElement;
    expect(document.activeElement).toBe(visible);
  });

  it('wraps to the last element on shift+tab when focus is outside the container', () => {
    const outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.appendChild(outside);

    render(<TrappedPanel />);
    // Move focus outside the trapped container.
    outside.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    const buttons = document.querySelectorAll('[data-testid="panel"] button');
    const last = buttons[buttons.length - 1] as HTMLButtonElement;
    expect(document.activeElement).toBe(last);
    document.body.removeChild(outside);
  });

  it('restores focus to the previously focused element on cleanup', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'outside';
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<TrappedPanel />);
    const firstInside = document.querySelectorAll('button')[1] as HTMLButtonElement;
    // First focusable inside the panel is at index 1 because `trigger` is index 0.
    expect(document.activeElement).toBe(firstInside);

    unmount();
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
