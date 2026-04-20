import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressRoot,
  CircularProgressTrack,
} from '../CircularProgress/index.js';

describe('CircularProgress', () => {
  it('renders with accessible label and both circles', () => {
    const { container } = render(<CircularProgress value={75} max={100} aria-label="Loading" />);
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });

  it('sets ARIA value attributes', () => {
    render(<CircularProgress value={40} max={100} aria-label="Sync" />);
    const bar = screen.getByRole('progressbar', { name: 'Sync' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<CircularProgress indeterminate aria-label="Working" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('auto-completes at 100%', () => {
    render(<CircularProgress value={100} aria-label="Done" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-complete', 'true');
  });

  it('renders children as a centered label', () => {
    render(
      <CircularProgress value={50} aria-label="Half">
        <span data-testid="inner">50%</span>
      </CircularProgress>,
    );
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });
});

describe('CircularProgress compound', () => {
  it('supports compound primitive composition', () => {
    const { container } = render(
      <CircularProgressRoot value={60} aria-label="Manual">
        <CircularProgressTrack>
          <CircularProgressIndicator />
        </CircularProgressTrack>
      </CircularProgressRoot>,
    );
    expect(screen.getByRole('progressbar', { name: 'Manual' })).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });
});
