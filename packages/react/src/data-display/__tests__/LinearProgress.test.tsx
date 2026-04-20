import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  LinearProgress,
  LinearProgressBuffer,
  LinearProgressIndicator,
  LinearProgressRoot,
  LinearProgressSegment,
  LinearProgressTrack,
} from '../LinearProgress/index.js';

describe('LinearProgress', () => {
  it('sets ARIA attributes based on value/max', () => {
    render(<LinearProgress value={40} max={100} aria-label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<LinearProgress indeterminate aria-label="Wait" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('clamps value between 0 and max', () => {
    render(<LinearProgress value={9999} max={100} aria-label="Full" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('auto-completes at 100% (data-complete flag)', () => {
    render(<LinearProgress value={100} aria-label="Complete" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-complete', 'true');
  });

  it('skips completion treatment when completionState="none"', () => {
    render(<LinearProgress value={100} completionState="none" aria-label="Raw" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('data-complete');
  });

  it('renders formatted value when showValue', () => {
    render(<LinearProgress value={60} max={100} showValue aria-label="X" />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders label + meta header when passed', () => {
    render(
      <LinearProgress value={50} label="Uploading" meta="2.4 MB/s" aria-label="Upload" />,
    );
    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.getByText('2.4 MB/s')).toBeInTheDocument();
  });

  it('renders a segment per descriptor when segments are supplied', () => {
    const { container } = render(
      <LinearProgress
        segments={[
          { value: 30, colorScheme: 'accent', label: 'a' },
          { value: 20, colorScheme: 'warning', label: 'b' },
          { value: 10, colorScheme: 'neutral', label: 'c' },
        ]}
        aria-label="Stacked"
      />,
    );
    expect(container.querySelectorAll('[aria-label="a"], [aria-label="b"], [aria-label="c"]')).toHaveLength(3);
  });
});

describe('LinearProgress compound', () => {
  it('renders a buffer bar alongside the indicator', () => {
    const { container } = render(
      <LinearProgressRoot value={40} aria-label="Stream">
        <LinearProgressTrack>
          <LinearProgressBuffer value={80} />
          <LinearProgressIndicator />
        </LinearProgressTrack>
      </LinearProgressRoot>,
    );
    // Track contains: buffer span + indicator span.
    const spans = container.querySelectorAll('[role="progressbar"] > div > span');
    expect(spans.length).toBeGreaterThanOrEqual(2);
  });

  it('exposes data-indeterminate when indeterminate', () => {
    render(
      <LinearProgressRoot indeterminate aria-label="Loading">
        <LinearProgressTrack>
          <LinearProgressIndicator />
        </LinearProgressTrack>
      </LinearProgressRoot>,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-indeterminate', 'true');
  });

  it('throws a helpful error when primitives render outside a Root', () => {
    // Suppress React's error boundary noise during the assertion.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<LinearProgressSegment value={10} />)).toThrow(
      /useLinearProgressContext/,
    );
    spy.mockRestore();
  });
});
