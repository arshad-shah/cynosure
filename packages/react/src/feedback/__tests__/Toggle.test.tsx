import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from '../Toggle/index.js';
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/index.js';

describe('Toggle', () => {
  it('toggles on click and fires onPressedChange', () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle onPressedChange={onPressedChange} aria-label="Bold">
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'Bold' });
    fireEvent.click(btn);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    fireEvent.click(btn);
    expect(onPressedChange).toHaveBeenCalledWith(false);
  });
});

describe('ToggleGroup', () => {
  it('single type restricts pressed state to one item', () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" onValueChange={onValueChange} aria-label="Align">
        <ToggleGroupItem value="left" aria-label="Left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">
          C
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Left' }));
    expect(onValueChange).toHaveBeenLastCalledWith('left');
  });

  it('multiple type emits an array', () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="multiple" onValueChange={onValueChange} aria-label="Format">
        <ToggleGroupItem value="bold" aria-label="Bold">
          B
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          I
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['bold']);
    fireEvent.click(screen.getByRole('button', { name: 'Italic' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['bold', 'italic']);
  });
});
