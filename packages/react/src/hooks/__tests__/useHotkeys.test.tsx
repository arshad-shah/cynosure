import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHotkeys } from '../useHotkeys.js';

function Harness({
  onHit,
  enabled = true,
}: {
  onHit: () => void;
  enabled?: boolean;
}) {
  useHotkeys('mod+k', onHit, { enabled });
  return <div data-testid="root" />;
}

const dispatchKey = (opts: KeyboardEventInit & { key: string }) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts });
  document.dispatchEvent(event);
  return event;
};

describe('useHotkeys', () => {
  it('fires on the configured combo', () => {
    const onHit = vi.fn();
    render(<Harness onHit={onHit} />);
    dispatchKey({ key: 'k', metaKey: true });
    expect(onHit).toHaveBeenCalledTimes(1);
  });

  it('maps mod to ctrl on non-mac', () => {
    const onHit = vi.fn();
    render(<Harness onHit={onHit} />);
    dispatchKey({ key: 'k', ctrlKey: true });
    expect(onHit).toHaveBeenCalledTimes(1);
  });

  it('is gated by the `enabled` flag', () => {
    const onHit = vi.fn();
    render(<Harness onHit={onHit} enabled={false} />);
    dispatchKey({ key: 'k', metaKey: true });
    expect(onHit).not.toHaveBeenCalled();
  });

  it('skips form fields by default', () => {
    const onHit = vi.fn();
    render(
      <>
        <Harness onHit={onHit} />
        <input data-testid="field" />
      </>,
    );
    const field = document.querySelector('input');
    field?.focus();
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'k',
      metaKey: true,
    });
    field?.dispatchEvent(event);
    expect(onHit).not.toHaveBeenCalled();
  });

  it('matches plain ctrl/meta when combo does not use mod', () => {
    const onHit = vi.fn();
    function Plain() {
      useHotkeys('ctrl+l', onHit);
      return null;
    }
    render(<Plain />);
    dispatchKey({ key: 'l', ctrlKey: true });
    expect(onHit).toHaveBeenCalled();
  });

  it('accepts an array of combos', () => {
    const onHit = vi.fn();
    function MultiCombo() {
      useHotkeys(['mod+s', 'mod+enter'], onHit);
      return null;
    }
    render(<MultiCombo />);
    dispatchKey({ key: 'Enter', ctrlKey: true });
    expect(onHit).toHaveBeenCalled();
  });

  it('respects keyup eventType', () => {
    const onHit = vi.fn();
    function Up() {
      useHotkeys('escape', onHit, { eventType: 'keyup' });
      return null;
    }
    render(<Up />);
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Esc', bubbles: true }));
    expect(onHit).toHaveBeenCalled();
  });

  it('opt-in to firing inside form tags', () => {
    const onHit = vi.fn();
    function FormFire() {
      useHotkeys('mod+k', onHit, { enableOnFormTags: true });
      return <input />;
    }
    render(<FormFire />);
    const input = document.querySelector('input');
    input?.focus();
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    expect(onHit).toHaveBeenCalled();
  });

  it('opts in to firing inside contenteditable', () => {
    const onHit = vi.fn();
    function Editable() {
      useHotkeys('mod+k', onHit, { enableOnContentEditable: true });
      return (
        <div contentEditable suppressContentEditableWarning>
          x
        </div>
      );
    }
    render(<Editable />);
    const editable = document.querySelector('[contenteditable]') as HTMLElement;
    editable.focus();
    editable.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
    );
    expect(onHit).toHaveBeenCalled();
  });

  it('does not preventDefault when configured off', () => {
    function NoPrev() {
      useHotkeys('escape', () => {}, { preventDefault: false });
      return null;
    }
    render(<NoPrev />);
    const ev = dispatchKey({ key: 'Escape' });
    expect(ev.defaultPrevented).toBe(false);
  });

  it('attaches to a custom EventTarget', () => {
    const onHit = vi.fn();
    const target = new EventTarget();
    function Custom() {
      useHotkeys('escape', onHit, { target });
      return null;
    }
    render(<Custom />);
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onHit).toHaveBeenCalled();
  });
});
