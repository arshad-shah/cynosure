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

  it('clears a cell when its value is erased', () => {
    render(<PinInput length={4} aria-label="OTP" defaultValue="12" />);
    const cells = getCells();
    fireEvent.change(at(cells, 1), { target: { value: '' } });
    expect(at(cells, 1).value).toBe('');
  });

  it('Backspace clears the current cell or steps back when empty', () => {
    render(<PinInput length={4} aria-label="OTP" defaultValue="12" />);
    const cells = getCells();
    at(cells, 1).focus();
    fireEvent.keyDown(at(cells, 1), { key: 'Backspace' });
    expect(at(cells, 1).value).toBe('');
    fireEvent.keyDown(at(cells, 1), { key: 'Backspace' });
    expect(document.activeElement).toBe(at(cells, 0));
  });

  it('arrow keys move focus and Home/End jump to the ends', () => {
    render(<PinInput length={5} aria-label="OTP" />);
    const cells = getCells();
    at(cells, 2).focus();
    fireEvent.keyDown(at(cells, 2), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(at(cells, 1));
    fireEvent.keyDown(at(cells, 1), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(at(cells, 2));
    fireEvent.keyDown(at(cells, 2), { key: 'End' });
    expect(document.activeElement).toBe(at(cells, 4));
    fireEvent.keyDown(at(cells, 4), { key: 'Home' });
    expect(document.activeElement).toBe(at(cells, 0));
  });

  it('masks display when mask is true', () => {
    render(<PinInput length={3} aria-label="OTP" mask defaultValue="12" />);
    const cells = getCells();
    expect(at(cells, 0).value).toBe('●');
    expect(at(cells, 1).value).toBe('●');
  });

  it('emits a hidden input when name is provided', () => {
    const { container } = render(
      <PinInput length={3} aria-label="OTP" defaultValue="12" name="pin" id="p" />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.value).toBe('12');
    expect(hidden.name).toBe('pin');
  });

  it('exposes invalid styling when invalid is set', () => {
    render(<PinInput length={3} aria-label="OTP" invalid />);
    const cells = getCells();
    expect(at(cells, 0)).toHaveAttribute('aria-invalid', 'true');
  });

  it('alphabetic type accepts letters and rejects digits', () => {
    render(<PinInput length={3} aria-label="OTP" type="alphabetic" />);
    const cells = getCells();
    fireEvent.change(at(cells, 0), { target: { value: '1' } });
    expect(at(cells, 0).value).toBe('');
    fireEvent.change(at(cells, 0), { target: { value: 'A' } });
    expect(at(cells, 0).value).toBe('A');
  });

  it('paste skips characters that fail the pattern test', () => {
    render(<PinInput length={4} aria-label="OTP" type="numeric" />);
    const cells = getCells();
    fireEvent.paste(at(cells, 0), {
      clipboardData: { getData: () => '1a2b' },
    } as unknown as ClipboardEvent);
    expect(at(cells, 0).value).toBe('1');
    expect(at(cells, 1).value).toBe('2');
  });
});
