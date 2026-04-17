import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Banner, BannerActions, BannerContent, clearBannerDismissal } from '../Banner/index.js';

const DISMISS_KEY = 'test-banner';

afterEach(() => {
  clearBannerDismissal(DISMISS_KEY);
});

describe('Banner', () => {
  it('renders content and actions slots', () => {
    render(
      <Banner status="info">
        <BannerContent>New version available.</BannerContent>
        <BannerActions>
          <button type="button">Learn more</button>
        </BannerActions>
      </Banner>,
    );
    expect(screen.getByText('New version available.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Learn more' })).toBeInTheDocument();
  });

  it('hides itself when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Banner closable onClose={onClose}>
        Close me
      </Banner>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Close me')).not.toBeInTheDocument();
  });

  it('dismissKey persists dismissal across renders', () => {
    const { unmount } = render(
      <Banner closable dismissKey={DISMISS_KEY}>
        Persistent
      </Banner>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    unmount();
    render(
      <Banner closable dismissKey={DISMISS_KEY}>
        Persistent
      </Banner>,
    );
    expect(screen.queryByText('Persistent')).not.toBeInTheDocument();
  });
});
