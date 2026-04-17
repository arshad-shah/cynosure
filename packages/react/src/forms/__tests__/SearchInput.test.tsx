import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchInput } from '../SearchInput/index.js';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires onSearch after the debounce window', () => {
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Search" onSearch={onSearch} debounceMs={200} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onSearch).toHaveBeenLastCalledWith('hello');
  });

  it('clears on Escape', () => {
    render(<SearchInput aria-label="Search" defaultValue="abc" />);
    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.value).toBe('');
  });

  it('fires onSubmit when the user presses Enter', () => {
    const onSubmit = vi.fn();
    render(<SearchInput aria-label="Search" defaultValue="query" onSubmit={onSubmit} />);
    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('query');
  });
});
