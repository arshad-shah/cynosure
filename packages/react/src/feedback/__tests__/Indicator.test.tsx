// packages/react/src/feedback/__tests__/Indicator.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Indicator } from '../Indicator/index.js';

describe('Indicator', () => {
  it('renders the single child untouched', () => {
    render(
      <Indicator content="3">
        <button type="button">child</button>
      </Indicator>,
    );
    const child = screen.getByRole('button', { name: 'child' });
    expect(child).toBeInTheDocument();
    expect(child).not.toHaveAttribute('aria-label');
  });

  it('renders the content as an accessible status by default', () => {
    render(
      <Indicator content="3">
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('3');
  });

  it('sets data-placement on the badge wrapper', () => {
    render(
      <Indicator content="1" placement="bottom-start">
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-placement', 'bottom-start');
  });

  it('defaults placement to top-end', () => {
    render(
      <Indicator content="1">
        <button type="button">child</button>
      </Indicator>,
    );
    expect(screen.getByRole('status')).toHaveAttribute('data-placement', 'top-end');
  });

  it('forwards offset as an inline --indicator-offset CSS variable', () => {
    render(
      <Indicator content="1" offset={6}>
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status');
    expect(status.getAttribute('style') ?? '').toContain('--indicator-offset: 6px');
  });

  it('invisible keeps the badge in the DOM but hidden', () => {
    render(
      <Indicator content="3" invisible>
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status', { hidden: true });
    expect(status).toHaveStyle({ visibility: 'hidden' });
  });

  it('hideOn predicate hides the badge when it returns true', () => {
    render(
      <Indicator content={0} hideOn={(v) => v === 0}>
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status', { hidden: true });
    expect(status).toHaveStyle({ visibility: 'hidden' });
  });

  it('dot-only indicator without label is aria-hidden', () => {
    render(
      <Indicator dot>
        <button type="button">child</button>
      </Indicator>,
    );
    // When aria-hidden, role="status" is removed.
    expect(screen.queryByRole('status')).toBeNull();
    const wrapper = screen.getByTestId('indicator-badge-wrapper');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('aria-label prop overrides content-derived label', () => {
    render(
      <Indicator content="3" aria-label="Three unread messages">
        <button type="button">child</button>
      </Indicator>,
    );
    expect(screen.getByRole('status')).toHaveAccessibleName('Three unread messages');
  });

  it('throws when given more than one child', () => {
    // Suppress React's error boundary noise for this assertion.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Indicator content="1">
          <span>a</span>
          <span>b</span>
        </Indicator>,
      ),
    ).toThrow();
    spy.mockRestore();
  });
});
