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
});
