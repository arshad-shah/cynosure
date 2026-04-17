import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PinInput } from '../PinInput/index.js';

const getCells = (): HTMLInputElement[] =>
  screen.getAllByLabelText(/otp digit/i) as HTMLInputElement[];

const at = (cells: HTMLInputElement[], index: number): HTMLInputElement => {
  const cell = cells[index];
  if (!cell) throw new Error(`Expected a PIN cell at index ${index}`);
  return cell;
};

describe('PinInput', () => {
  it('renders the configured number of cells', () => {
    render(<PinInput length={4} aria-label="OTP" />);
    expect(screen.getAllByLabelText(/otp digit/i)).toHaveLength(4);
  });

  it('moves focus to the next cell after a digit is typed', () => {
    render(<PinInput length={4} aria-label="OTP" />);
    const cells = getCells();
    at(cells, 0).focus();
    fireEvent.change(at(cells, 0), { target: { value: '1' } });
    expect(document.activeElement).toBe(at(cells, 1));
  });

  it('calls onComplete when all cells are filled', () => {
    const onComplete = vi.fn();
    render(<PinInput length={3} onComplete={onComplete} aria-label="OTP" />);
    const cells = getCells();
    fireEvent.change(at(cells, 0), { target: { value: '1' } });
    fireEvent.change(at(cells, 1), { target: { value: '2' } });
    fireEvent.change(at(cells, 2), { target: { value: '3' } });
    expect(onComplete).toHaveBeenCalledWith('123');
  });

  it('ignores non-matching characters for numeric type', () => {
    render(<PinInput length={4} type="numeric" aria-label="OTP" />);
    const cells = getCells();
    fireEvent.change(at(cells, 0), { target: { value: 'a' } });
    expect(at(cells, 0).value).toBe('');
  });

  it('distributes pasted characters across cells', () => {
    render(<PinInput length={4} aria-label="OTP" />);
    const cells = getCells();
    fireEvent.paste(at(cells, 0), {
      clipboardData: { getData: () => '1234' },
    } as unknown as ClipboardEvent);
    expect(at(cells, 0).value).toBe('1');
    expect(at(cells, 3).value).toBe('4');
  });
});
