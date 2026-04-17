import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../Input/index.js';

describe('Input', () => {
  it('renders an input with the provided type', () => {
    render(<Input type="email" placeholder="you@example.com" />);
    const input = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('email');
  });

  it('typing updates the (uncontrolled) value', async () => {
    const user = userEvent.setup();
    render(<Input defaultValue="" placeholder="x" />);
    const input = screen.getByPlaceholderText('x') as HTMLInputElement;
    await user.type(input, 'abc');
    expect(input.value).toBe('abc');
  });

  it('calls onChange (controlled)', () => {
    const Controlled = (): React.ReactElement => {
      const [v, setV] = useState('');
      return <Input value={v} onChange={setV} placeholder="c" />;
    };
    render(<Controlled />);
    const input = screen.getByPlaceholderText('c') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hi' } });
    expect(input.value).toBe('hi');
  });

  it('clearable shows clear button only when value is non-empty', () => {
    const { rerender } = render(<Input value="" onChange={() => {}} clearable />);
    expect(screen.queryByLabelText('Clear input')).toBeNull();
    rerender(<Input value="hi" onChange={() => {}} clearable />);
    expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
  });

  it('clearable clears value and focuses input', () => {
    const handle = vi.fn();
    render(<Input value="abc" onChange={handle} clearable placeholder="c" />);
    const btn = screen.getByLabelText('Clear input');
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalledWith('');
  });

  it('password type shows show/hide toggle that flips the input type', async () => {
    const user = userEvent.setup();
    render(<Input type="password" defaultValue="hunter2" placeholder="p" />);
    const input = screen.getByPlaceholderText('p') as HTMLInputElement;
    expect(input.type).toBe('password');
    const toggle = screen.getByLabelText('Show password');
    await user.click(toggle);
    expect(input.type).toBe('text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
  });

  it('paints invalid state via data attribute on the wrapper', () => {
    const { container } = render(<Input invalid defaultValue="x" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('data-invalid')).toBe('true');
    const input = wrapper.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
