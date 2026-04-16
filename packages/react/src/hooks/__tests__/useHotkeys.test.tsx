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
});
