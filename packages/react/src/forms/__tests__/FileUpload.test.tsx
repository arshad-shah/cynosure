import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from '../FileUpload/index.js';

const makeFile = (name: string, bytes: number, type: string): File => {
  const file = new File(['a'.repeat(bytes)], name, { type });
  return file;
};

describe('FileUpload', () => {
  it('renders a keyboard-focusable drop zone', () => {
    render(<FileUpload />);
    const zone = screen.getByRole('button', { name: /drop files/i });
    expect(zone).toHaveAttribute('tabindex', '0');
  });

  it('lists the selected file after change', () => {
    const onChange = vi.fn();
    render(<FileUpload onFilesChange={onChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('memo.txt', 10, 'text/plain');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    expect(onChange).toHaveBeenCalledWith([file]);
    expect(screen.getByText('memo.txt')).toBeInTheDocument();
  });

  it('rejects files that exceed maxSize via onError', () => {
    const onError = vi.fn();
    const onChange = vi.fn();
    render(<FileUpload maxSize={4} onError={onError} onFilesChange={onChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('big.txt', 10, 'text/plain');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ reason: 'size' }));
  });

  it('rejects files whose extension does not match accept', () => {
    const onError = vi.fn();
    render(<FileUpload accept=".png" onError={onError} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('memo.txt', 4, 'text/plain');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ reason: 'type' }));
  });

  it('accepts a wildcard mime token', () => {
    const onChange = vi.fn();
    render(<FileUpload accept="image/*" onFilesChange={onChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('photo.png', 4, 'image/png');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    expect(onChange).toHaveBeenCalled();
  });

  it('rejects an exact-mime mismatch', () => {
    const onError = vi.fn();
    render(<FileUpload accept="image/png" onError={onError} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('memo.txt', 4, 'text/plain');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ reason: 'type' }));
  });

  it('caps total files at maxCount and reports the count error', () => {
    const onError = vi.fn();
    const onChange = vi.fn();
    render(<FileUpload multiple maxCount={1} onError={onError} onFilesChange={onChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const a = makeFile('a.txt', 4, 'text/plain');
    const b = makeFile('b.txt', 4, 'text/plain');
    Object.defineProperty(input, 'files', { value: [a, b] });
    fireEvent.change(input);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ reason: 'count' }));
    expect(onChange).toHaveBeenLastCalledWith([a]);
  });

  it('removes a file via the per-row remove button', () => {
    const onChange = vi.fn();
    render(<FileUpload onFilesChange={onChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('memo.txt', 4, 'text/plain');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    fireEvent.click(screen.getByRole('button', { name: /remove memo/i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('opens the file dialog on Enter and Space', () => {
    render(<FileUpload />);
    const zone = screen.getByRole('button', { name: /drop files/i });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    let clicks = 0;
    input.addEventListener('click', () => {
      clicks += 1;
    });
    fireEvent.keyDown(zone, { key: 'Enter' });
    fireEvent.keyDown(zone, { key: ' ' });
    expect(clicks).toBeGreaterThanOrEqual(2);
  });

  it('renders the disabled state and skips the click handler', () => {
    render(<FileUpload disabled />);
    const zone = screen.getByRole('button', { name: /drop files/i });
    expect(zone).toHaveAttribute('aria-disabled', 'true');
    expect(zone).toHaveAttribute('tabindex', '-1');
  });
});
