import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Anchor } from '../Anchor/index.js';

describe('Anchor', () => {
  it('renders the heading with the requested level and id', () => {
    render(
      <Anchor id="installation" level={3}>
        Installation
      </Anchor>,
    );
    const heading = screen.getByRole('heading', { level: 3, name: /Installation/ });
    expect(heading).toHaveAttribute('id', 'installation');
  });

  it('calls onCopy after a click when clipboard is available', () => {
    const onCopy = vi.fn();
    // stub clipboard
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(
      <Anchor id="setup" onCopy={onCopy}>
        Setup
      </Anchor>,
    );
    const link = screen.getByRole('link', { name: 'Copy link to section' });
    fireEvent.click(link);
    return Promise.resolve().then(() => {
      expect(onCopy).toHaveBeenCalled();
    });
  });
});
