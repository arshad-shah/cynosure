import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Rating } from '../Rating/index.js';

describe('Rating', () => {
  it('reports the current rating via aria attributes', () => {
    render(<Rating aria-label="Quality" defaultValue={3} max={5} />);
    const slider = screen.getByRole('slider', { name: /quality/i });
    expect(slider).toHaveAttribute('aria-valuenow', '3');
    expect(slider).toHaveAttribute('aria-valuemax', '5');
  });

  it('increments with ArrowRight', () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Quality" defaultValue={3} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider');
    slider.focus();
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenCalledWith(4);
  });

  it('is readonly when the prop is set', () => {
    render(<Rating aria-label="Quality" defaultValue={2} readOnly />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-readonly', 'true');
  });
});
