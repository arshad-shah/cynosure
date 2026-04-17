import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NumberInput } from '../NumberInput/index.js';

describe('NumberInput', () => {
  it('renders an input with increment and decrement buttons', () => {
    render(<NumberInput defaultValue={10} aria-label="Qty" />);
    expect(screen.getByLabelText('Qty')).toBeInTheDocument();
    expect(screen.getByLabelText('Increment')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrement')).toBeInTheDocument();
  });

  it('calls onChange when the input value changes', () => {
    const handle = vi.fn();
    render(
      <NumberInput defaultValue={10} step={1} minValue={0} onChange={handle} aria-label="Qty" />,
    );
    const input = screen.getByLabelText('Qty') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.blur(input);
    expect(handle).toHaveBeenCalledWith(12);
  });

  it('clamps to minValue/maxValue when incrementing', () => {
    const handle = vi.fn();
    render(
      <NumberInput defaultValue={5} maxValue={5} step={1} onChange={handle} aria-label="Cap" />,
    );
    fireEvent.click(screen.getByLabelText('Increment'));
    expect(handle).not.toHaveBeenCalled();
  });

  it('renders prefix and suffix inline', () => {
    render(<NumberInput defaultValue={256} prefix="$" suffix="px" aria-label="Size" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('px')).toBeInTheDocument();
  });
});
