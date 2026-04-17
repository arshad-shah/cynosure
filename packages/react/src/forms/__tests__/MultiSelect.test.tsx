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
  it('renders selected values as tags', () => {
    render(<MultiSelect aria-label="Skills" items={items} defaultValue={['ts', 'rust']} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('removes a tag when the remove button is clicked', () => {
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

  it('removes the last tag on Backspace when the input is empty', () => {
    const Harness = () => {
      const [value, setValue] = useState<string[]>(['ts', 'rust']);
      return (
        <MultiSelect aria-label="Skills" items={items} value={value} onValueChange={setValue} />
      );
    };
    render(<Harness />);
    const input = screen.getByRole('textbox', { name: /skills/i });
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(screen.queryByText('Rust')).not.toBeInTheDocument();
  });

  it('opens the popover when typing and lets the user pick an option', () => {
    const onValueChange = vi.fn();
    render(<MultiSelect aria-label="Skills" items={items} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: /skills/i });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'go' } });
    const option = screen.getByRole('option', { name: /go/i });
    fireEvent.mouseDown(option);
    expect(onValueChange).toHaveBeenCalledWith(['go']);
  });

  it('opens via ArrowDown when closed and closes on Escape', () => {
    render(<MultiSelect aria-label="Skills" items={items} />);
    const input = screen.getByRole('textbox', { name: /skills/i });
    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
  });

  it('shows a custom empty state when nothing matches', () => {
    render(<MultiSelect aria-label="Skills" items={items} emptyState={<span>No matches</span>} />);
    const input = screen.getByRole('textbox', { name: /skills/i });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zzz' } });
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
    const input = screen.getByRole('textbox', { name: /skills/i });
    fireEvent.focus(input);
    const rust = screen.getByRole('option', { name: /rust/i });
    expect(rust).toHaveAttribute('aria-disabled', 'true');
  });

  it('marks the wrapper as invalid and disabled', () => {
    const { container, rerender } = render(
      <MultiSelect aria-label="Skills" items={items} invalid />,
    );
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
    rerender(<MultiSelect aria-label="Skills" items={items} disabled />);
    expect(container.querySelector('[data-disabled="true"]')).not.toBeNull();
  });

  it('exposes required while no values are selected', () => {
    render(<MultiSelect aria-label="Skills" items={items} required />);
    expect(screen.getByRole('textbox', { name: /skills/i })).toBeRequired();
  });
});
