import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MultiSelect } from '../MultiSelect/index.js';

const items = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
];

describe('MultiSelect', () => {
  it('renders selected values as chips', () => {
    render(<MultiSelect aria-label="Skills" items={items} defaultValue={['ts', 'rust']} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('removes a chip when its remove button is clicked', () => {
    const onValueChange = vi.fn();
    render(
      <MultiSelect
        aria-label="Skills"
        items={items}
        defaultValue={['ts']}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /remove typescript/i }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it('opens the dropdown on trigger click and toggles an option', () => {
    const onValueChange = vi.fn();
    render(<MultiSelect aria-label="Skills" items={items} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: /skills/i }));
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Go' }));
    expect(onValueChange).toHaveBeenCalledWith(['go']);
  });

  it('keeps selected options in the list, marked selected', () => {
    render(<MultiSelect aria-label="Skills" items={items} defaultValue={['ts']} />);
    fireEvent.click(screen.getByRole('combobox', { name: /skills/i }));
    expect(screen.getByRole('option', { name: 'TypeScript' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('filters via the in-dropdown search field', () => {
    render(<MultiSelect aria-label="Skills" items={items} />);
    fireEvent.click(screen.getByRole('combobox', { name: /skills/i }));
    const search = screen.getByRole('searchbox', { name: /search/i });
    fireEvent.change(search, { target: { value: 'go' } });
    expect(screen.getByRole('option', { name: 'Go' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Rust' })).not.toBeInTheDocument();
  });

  it('removes the last chip on Backspace when the search is empty', () => {
    const Harness = () => {
      const [value, setValue] = useState<string[]>(['ts', 'rust']);
      return (
        <MultiSelect aria-label="Skills" items={items} value={value} onValueChange={setValue} />
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole('combobox', { name: /skills/i }));
    const search = screen.getByRole('searchbox', { name: /search/i });
    fireEvent.keyDown(search, { key: 'Backspace' });
    // The Rust chip (its remove button) is gone; Rust remains in the list as a
    // selectable option, so we assert on the chip rather than the label text.
    expect(screen.queryByRole('button', { name: /remove rust/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove typescript/i })).toBeInTheDocument();
  });

  it('opens via ArrowDown when closed and closes on Escape', () => {
    render(<MultiSelect aria-label="Skills" items={items} />);
    const trigger = screen.getByRole('combobox', { name: /skills/i });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const search = screen.getByRole('searchbox', { name: /search/i });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(search, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows a custom empty state when nothing matches', () => {
    render(<MultiSelect aria-label="Skills" items={items} emptyState={<span>No matches</span>} />);
    fireEvent.click(screen.getByRole('combobox', { name: /skills/i }));
    const search = screen.getByRole('searchbox', { name: /search/i });
    fireEvent.change(search, { target: { value: 'zzz' } });
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('caps selection at maxSelected and disables further additions', () => {
    const Harness = () => {
      const [value, setValue] = useState<string[]>(['ts']);
      return (
        <MultiSelect
          aria-label="Skills"
          items={items}
          value={value}
          onValueChange={setValue}
          maxSelected={1}
        />
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole('combobox', { name: /skills/i }));
    // The selected one stays togglable; unselected ones are blocked at the cap.
    expect(screen.getByRole('option', { name: 'Rust' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('option', { name: 'TypeScript' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('marks the trigger as invalid and disabled', () => {
    const { container, rerender } = render(
      <MultiSelect aria-label="Skills" items={items} invalid />,
    );
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
    rerender(<MultiSelect aria-label="Skills" items={items} disabled />);
    expect(container.querySelector('[data-disabled="true"]')).not.toBeNull();
  });

  it('exposes required while no values are selected', () => {
    render(<MultiSelect aria-label="Skills" items={items} required />);
    expect(screen.getByRole('combobox', { name: /skills/i })).toBeRequired();
  });
});
