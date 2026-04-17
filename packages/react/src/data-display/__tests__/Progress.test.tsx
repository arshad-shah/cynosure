import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress, ProgressCircle } from '../Progress/index.js';

describe('Progress', () => {
  it('sets ARIA attributes based on value/max', () => {
    render(<Progress value={40} max={100} label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<Progress indeterminate label="Wait" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('clamps value between 0 and max', () => {
    render(<Progress value={9999} max={100} label="Full" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders formatted value label when showValue', () => {
    render(<Progress value={60} max={100} showValue label="X" />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});

describe('ProgressCircle', () => {
  it('renders with accessible label and svg', () => {
    const { container } = render(<ProgressCircle value={75} max={100} label="Loading" />);
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });
});
