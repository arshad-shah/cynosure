import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRovingFocus } from '../Sidebar/useRovingFocus.js';

function Harness() {
  const { containerRef } = useRovingFocus<HTMLDivElement>();
  return (
    <div ref={containerRef} data-testid="nav">
      <button type="button" data-roving-focus-item="">
        One
      </button>
      <button type="button" data-roving-focus-item="">
        Two
      </button>
      <button type="button" data-roving-focus-item="" disabled>
        Three
      </button>
      <button type="button" data-roving-focus-item="">
        Four
      </button>
    </div>
  );
}

describe('useRovingFocus', () => {
  it('ArrowDown moves focus to next enabled item and wraps', () => {
    render(<Harness />);
    const [one, two, , four] = screen.getAllByRole('button') as HTMLButtonElement[];
    one.focus();
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(two);
    // skip disabled Three, go to Four
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(four);
    // wrap to One
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(one);
  });

  it('ArrowUp wraps backwards and Home/End jump', () => {
    render(<Harness />);
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    buttons[1].focus();
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'End' });
    expect(document.activeElement).toBe(buttons[3]);
    fireEvent.keyDown(screen.getByTestId('nav'), { key: 'Home' });
    expect(document.activeElement).toBe(buttons[0]);
  });
});
