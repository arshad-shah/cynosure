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

  it('clicking the currently-selected star clears back to 0', () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Quality" defaultValue={3} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider');
    const stars = slider.querySelectorAll('[role="presentation"]');
    fireEvent.click(stars[2]);
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('clicking a different star sets the new value', () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Quality" defaultValue={2} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider');
    const stars = slider.querySelectorAll('[role="presentation"]');
    fireEvent.click(stars[3]);
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it('does not respond to clicks when disabled', () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Quality" defaultValue={2} disabled onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider');
    const stars = slider.querySelectorAll('[role="presentation"]');
    fireEvent.click(stars[3]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders the trailing renderValue slot and exposes previewValue', () => {
    render(
      <Rating
        aria-label="Quality"
        defaultValue={2}
        renderValue={(v, m, preview) => `${preview ?? v}/${m}`}
      />,
    );
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('decrements with ArrowLeft and clamps at zero', () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Quality" defaultValue={1} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('jumps to max with End and to zero with Home', () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Quality" defaultValue={2} max={4} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('ignores ArrowUp when readOnly', () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Quality" defaultValue={2} readOnly onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('emits a hidden input when name is set', () => {
    const { container } = render(
      <Rating aria-label="Quality" defaultValue={3} name="rating" id="r" />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe('3');
    expect(hidden.name).toBe('rating');
  });

  it('renders half-star fills when allowHalf and value is fractional', () => {
    const { container } = render(
      <Rating aria-label="Quality" defaultValue={2.5} allowHalf max={3} />,
    );
    expect(container.querySelector('[data-half="true"]')).not.toBeNull();
  });

  it('exposes aria-required when required is set', () => {
    render(<Rating aria-label="Quality" defaultValue={0} required />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-required', 'true');
  });

  it('uses ArrowUp to increment', () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Quality" defaultValue={1} onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' });
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });

  it('clears hover preview on pointer leave', () => {
    render(
      <Rating
        aria-label="Quality"
        defaultValue={1}
        renderValue={(v, _m, preview) => String(preview ?? v)}
      />,
    );
    fireEvent.pointerLeave(screen.getByRole('slider'));
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
