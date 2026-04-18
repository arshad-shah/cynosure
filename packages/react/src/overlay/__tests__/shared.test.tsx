import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OverlayPortal } from '../shared/OverlayPortal.js';
import { __resetScrollLock, lockBodyScroll } from '../shared/ScrollLock.js';

describe('ScrollLock', () => {
  it('locks body scroll on first lock and restores on last unlock', () => {
    __resetScrollLock();
    document.body.style.overflow = '';
    const unlockA = lockBodyScroll();
    expect(document.body.style.overflow).toBe('hidden');
    const unlockB = lockBodyScroll();
    // still locked after a second lock
    expect(document.body.style.overflow).toBe('hidden');
    unlockA();
    // still locked — another overlay holds the lock
    expect(document.body.style.overflow).toBe('hidden');
    unlockB();
    expect(document.body.style.overflow).toBe('');
  });

  it('is idempotent — calling unlock twice is a no-op', () => {
    __resetScrollLock();
    const unlock = lockBodyScroll();
    unlock();
    unlock();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('OverlayPortal', () => {
  it('lazily creates the #cynosure-portal default container and portals into it', () => {
    render(
      <OverlayPortal>
        <div data-testid="portaled">Hi</div>
      </OverlayPortal>,
    );
    const portalNode = document.getElementById('cynosure-portal');
    expect(portalNode).not.toBeNull();
    expect(screen.getByTestId('portaled').parentElement).toBe(portalNode);
  });

  it('renders inline when disabled', () => {
    const { container } = render(
      <OverlayPortal disabled>
        <span data-testid="inline">x</span>
      </OverlayPortal>,
    );
    expect(container.querySelector('[data-testid="inline"]')).not.toBeNull();
  });
});
