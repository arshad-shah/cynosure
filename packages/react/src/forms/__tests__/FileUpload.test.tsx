import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload, FileUploadList, FileUploadTrigger } from '../FileUpload/index.js';

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

  describe('variants', () => {
    it('renders the default variant with a Browse files button', () => {
      const { container } = render(<FileUpload />);
      const zone = screen.getByRole('button', { name: /drop files/i });
      expect(zone).toHaveAttribute('data-variant', 'default');
      const innerButton = container.querySelector('[data-variant="default"] > button');
      expect(innerButton).not.toBeNull();
      expect(innerButton?.textContent).toMatch(/browse files/i);
    });

    it('renders the card variant with an Upload a file label', () => {
      const { container } = render(<FileUpload variant="card" />);
      const zone = container.querySelector('[data-variant="card"]');
      expect(zone).not.toBeNull();
      expect(screen.getByText(/upload a file/i)).toBeInTheDocument();
    });

    it('renders the compact variant with inline copy', () => {
      const { container } = render(<FileUpload variant="compact" />);
      const zone = container.querySelector('[data-variant="compact"]');
      expect(zone).not.toBeNull();
      expect(screen.getByText(/drop a file, or click to browse/i)).toBeInTheDocument();
    });

    it('renders the minimal variant as an Attach file trigger', () => {
      render(<FileUpload variant="minimal" />);
      expect(screen.getByRole('button', { name: /attach file/i })).toHaveAttribute(
        'data-variant',
        'minimal',
      );
    });

    it('clicking the inner Browse button opens the file dialog via the outer zone', () => {
      render(<FileUpload />);
      const zone = screen.getByRole('button', { name: /drop files/i });
      const innerButton = zone.querySelector('button') as HTMLButtonElement;
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      let clicks = 0;
      input.addEventListener('click', () => {
        clicks += 1;
      });
      fireEvent.click(innerButton);
      expect(clicks).toBe(1);
    });
  });

  describe('onPreview', () => {
    const seedFile = (name = 'memo.txt', type = 'text/plain'): File =>
      new File(['a'], name, { type });

    it('renders a preview IconButton only when onPreview is provided', () => {
      const onPreview = vi.fn();
      render(
        <FileUpload defaultValue={[seedFile()]}>
          <FileUploadTrigger />
          <FileUploadList onPreview={onPreview} />
        </FileUpload>,
      );
      expect(screen.getByRole('button', { name: /preview memo/i })).toBeInTheDocument();
    });

    it('omits the preview IconButton when onPreview is not provided', () => {
      render(
        <FileUpload defaultValue={[seedFile()]}>
          <FileUploadTrigger />
          <FileUploadList />
        </FileUpload>,
      );
      expect(screen.queryByRole('button', { name: /preview memo/i })).toBeNull();
    });

    it('invokes onPreview with the file and index when clicked', () => {
      const onPreview = vi.fn();
      const file = seedFile('report.pdf', 'application/pdf');
      render(
        <FileUpload defaultValue={[file]}>
          <FileUploadTrigger />
          <FileUploadList onPreview={onPreview} />
        </FileUpload>,
      );
      fireEvent.click(screen.getByRole('button', { name: /preview report/i }));
      expect(onPreview).toHaveBeenCalledWith(file, 0);
    });
  });
});
