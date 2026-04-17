import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RangeSlider } from '../RangeSlider/index.js';
import { Slider } from '../Slider/index.js';

describe('Slider', () => {
  it('renders a slider input with the provided default value', () => {
    render(<Slider aria-label="Volume" defaultValue={40} minValue={0} maxValue={100} />);
    const input = screen.getByRole('slider') as HTMLInputElement;
    expect(input.value).toBe('40');
  });

  it('responds to arrow keys to change the value', () => {
    const onChange = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={10}
        minValue={0}
        maxValue={100}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('slider');
    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('RangeSlider', () => {
  it('renders two slider thumbs', () => {
    render(<RangeSlider label="Price" defaultValue={[10, 40]} minValue={0} maxValue={100} />);
    const inputs = screen.getAllByRole('slider') as HTMLInputElement[];
    expect(inputs).toHaveLength(2);
    expect(inputs[0]?.value).toBe('10');
    expect(inputs[1]?.value).toBe('40');
  });
});
