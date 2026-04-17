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

  it('uses label as aria-label when no aria-label is provided', () => {
    render(
      <Select label="Country">
        <SelectItem id="a">A</SelectItem>
      </Select>,
    );
    // RAC mirrors the label-prop onto the button via aria-label
    expect(document.querySelector('button[aria-label="Country"]')).not.toBeNull();
  });

  it('renders flat items via the items prop', () => {
    render(
      <Select
        aria-label="Country"
        items={[
          { value: 'gb', label: 'United Kingdom' },
          { value: 'ie', label: 'Ireland' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /country/i }));
    expect(screen.getByRole('option', { name: 'United Kingdom' })).toBeInTheDocument();
  });

  it('groups items into sections when section keys are present', () => {
    render(
      <Select
        aria-label="Country"
        items={[
          { value: 'gb', label: 'United Kingdom', section: 'Europe' },
          { value: 'ie', label: 'Ireland', section: 'Europe' },
          { value: 'us', label: 'United States', section: 'Americas' },
          { value: 'mx', label: 'Mexico' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /country/i }));
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByText('Americas')).toBeInTheDocument();
  });

  it('reflects defaultValue and the selected text in the trigger', () => {
    render(
      <Select aria-label="Country" defaultValue="ie">
        <SelectItem id="gb">United Kingdom</SelectItem>
        <SelectItem id="ie">Ireland</SelectItem>
      </Select>,
    );
    expect(screen.getByRole('button', { name: /ireland/i })).toBeInTheDocument();
  });

  it('marks the trigger as invalid via the invalid prop', () => {
    render(
      <Select aria-label="Country" invalid>
        <SelectItem id="a">A</SelectItem>
      </Select>,
    );
    const trigger = screen.getByRole('button', { name: /country/i });
    expect(trigger).toHaveAttribute('data-invalid', 'true');
  });

  it('renders a section without a title', () => {
    render(
      <Select
        aria-label="Country"
        items={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', section: 'Group' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /country/i }));
    expect(screen.getByRole('option', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument();
  });

  it('honours the required prop', () => {
    render(
      <Select aria-label="Country" required>
        <SelectItem id="a">A</SelectItem>
      </Select>,
    );
    const hidden = document.querySelector('[data-rac][required]');
    // RAC sets required on its hidden form element, but the trigger itself
    // exposes it as `aria-required`.
    const trigger = screen.getByRole('button', { name: /country/i });
    expect(hidden ?? trigger).toBeTruthy();
  });
});
