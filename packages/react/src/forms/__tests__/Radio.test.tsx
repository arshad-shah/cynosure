import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from '../Radio/index.js';
import { RadioGroup } from '../RadioGroup/index.js';

describe('Radio + RadioGroup', () => {
  it('renders the provided radios inside the group', () => {
    render(
      <RadioGroup aria-label="plan">
        <Radio value="hobby">Hobby</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('clicking a radio selects it and reports via onValueChange', () => {
    const handle = vi.fn();
    render(
      <RadioGroup onValueChange={handle} aria-label="plan">
        <Radio value="hobby">Hobby</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>,
    );
    const [hobby, pro] = screen.getAllByRole('radio');
    fireEvent.click(pro as HTMLElement);
    expect(handle).toHaveBeenCalledWith('pro');
    expect(pro?.getAttribute('data-state')).toBe('checked');
    expect(hobby?.getAttribute('data-state')).toBe('unchecked');
  });

  it('exposes radiogroup role for keyboard navigation contract', () => {
    render(
      <RadioGroup defaultValue="a" aria-label="items">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    // Radix manages roving-tabindex + arrow keys — we delegate entirely
    // there and just verify the group exposes the right role so Lumen's
    // thin wrapper isn't swallowing it.
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });
});
