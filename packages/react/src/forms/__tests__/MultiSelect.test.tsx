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
});
