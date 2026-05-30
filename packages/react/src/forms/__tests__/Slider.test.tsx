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

describe('Slider extras', () => {
  it('renders the label and showValue output', () => {
    render(<Slider label="Volume" defaultValue={20} showValue />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('renders marks below the track', () => {
    const { container } = render(
      <Slider
        aria-label="Volume"
        defaultValue={50}
        marks={[{ value: 0, label: '0' }, { value: 50 }, { value: 100, label: '100' }]}
      />,
    );
    expect(container.querySelector('[style*="inset-inline-start: 0%"]')).not.toBeNull();
    expect(container.querySelector('[style*="inset-inline-start: 100%"]')).not.toBeNull();
  });

  it('marks the track as disabled when isDisabled is set', () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={20} isDisabled />);
    expect(container.querySelector('[data-disabled="true"]')).not.toBeNull();
  });

  it('positions each tick mark at its own offset along the track', () => {
    const { container } = render(
      <Slider
        aria-label="Zoom"
        minValue={0}
        maxValue={100}
        defaultValue={50}
        marks={[
          { value: 0, label: '0' },
          { value: 50, label: '50' },
          { value: 100, label: '100' },
        ]}
      />,
    );
    // Each mark wrapper carries its own inline offset so they spread across the
    // track instead of bunching at the start (regression guard).
    const wrappers = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="inset-inline-start"]'),
    ).filter((el) => el.style.getPropertyValue('inset-inline-start').endsWith('%'));
    const offsets = wrappers.map((el) => el.style.getPropertyValue('inset-inline-start'));
    expect(offsets).toEqual(expect.arrayContaining(['0%', '50%', '100%']));
    // The offset is only honored because the wrapper is positioned — without a
    // positioning class the marks collapse to the track's start.
    for (const el of wrappers) {
      expect(el.className).not.toBe('');
    }
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

  it('shows the value output and label header when configured', () => {
    render(<RangeSlider label="Price" defaultValue={[10, 40]} showValue />);
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('reports both endpoints via the onChange callback', () => {
    const onChange = vi.fn();
    render(<RangeSlider label="Price" defaultValue={[10, 40]} onChange={onChange} />);
    const inputs = screen.getAllByRole('slider');
    const first = inputs[0];
    if (!first) throw new Error('RangeSlider did not render a first thumb');
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(Array.isArray(last)).toBe(true);
  });

  it('marks the track as disabled when isDisabled is set', () => {
    const { container } = render(<RangeSlider label="Price" defaultValue={[10, 40]} isDisabled />);
    expect(container.querySelector('[data-disabled="true"]')).not.toBeNull();
  });
});
