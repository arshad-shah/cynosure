import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select, SelectItem } from '../Select/index.js';

const renderDefault = (onValueChange = vi.fn()) =>
  render(
    <Select aria-label="Country" onValueChange={onValueChange}>
      <SelectItem id="gb">United Kingdom</SelectItem>
      <SelectItem id="ie">Ireland</SelectItem>
      <SelectItem id="us">United States</SelectItem>
    </Select>,
  );

describe('Select', () => {
  it('renders a placeholder when nothing is selected', () => {
    render(
      <Select aria-label="Country" placeholder="Pick one">
        <SelectItem id="a">A</SelectItem>
      </Select>,
    );
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('opens on click and shows options', () => {
    renderDefault();
    const trigger = screen.getByRole('button', { name: /country/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('option', { name: 'United Kingdom' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ireland' })).toBeInTheDocument();
  });

  it('selects an option and fires onValueChange', () => {
    const onValueChange = vi.fn();
    renderDefault(onValueChange);
    const trigger = screen.getByRole('button', { name: /country/i });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'Ireland' }));
    expect(onValueChange).toHaveBeenCalledWith('ie');
  });

  it('can be disabled via the disabled prop', () => {
    render(
      <Select aria-label="Country" disabled>
        <SelectItem id="a">A</SelectItem>
      </Select>,
    );
    const trigger = screen.getByRole('button', { name: /country/i });
    expect(trigger).toBeDisabled();
  });
});
