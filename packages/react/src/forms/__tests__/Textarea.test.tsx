import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from '../Textarea/index.js';

describe('Textarea', () => {
  it('renders a <textarea> with the configured rows', () => {
    render(<Textarea rows={5} placeholder="t" />);
    const ta = screen.getByPlaceholderText('t') as HTMLTextAreaElement;
    expect(ta.tagName).toBe('TEXTAREA');
    expect(ta.rows).toBe(5);
  });

  it('typing updates the value', () => {
    render(<Textarea defaultValue="" placeholder="t" />);
    const ta = screen.getByPlaceholderText('t') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'hello\nworld' } });
    expect(ta.value).toBe('hello\nworld');
  });

  it('applies the auto-resize class when autoResize is true', async () => {
    const { textareaAutoResize } = await import('../Textarea/Textarea.css.js');
    render(<Textarea autoResize placeholder="t" />);
    const ta = screen.getByPlaceholderText('t') as HTMLTextAreaElement;
    expect(ta.className).toContain(textareaAutoResize);
  });
});
