import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagsInput } from '../TagsInput/index.js';

describe('TagsInput', () => {
  it('commits the current draft on Enter', () => {
    const onValueChange = vi.fn();
    render(<TagsInput aria-label="Tags" onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: /tags/i });
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith(['react']);
  });

  it('removes the last tag on Backspace when the input is empty', () => {
    const onValueChange = vi.fn();
    render(<TagsInput aria-label="Tags" defaultValue={['a', 'b']} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: /tags/i });
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onValueChange).toHaveBeenCalledWith(['a']);
  });

  it('ignores duplicate tags when unique=true', () => {
    const onValueChange = vi.fn();
    render(<TagsInput aria-label="Tags" defaultValue={['react']} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: /tags/i });
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
