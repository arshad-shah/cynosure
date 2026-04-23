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

  // --- New slot API ---

  it('renders leadingSlot content inside a well with data-slot-kind', () => {
    render(<Input leadingSlot={<span data-testid="lead">https://</span>} placeholder="x" />);
    const lead = screen.getByTestId('lead');
    const well = lead.parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('inert');
  });

  it('renders trailingSlot content inside a well with data-slot-kind', () => {
    render(<Input trailingSlot={<span data-testid="trail">.com</span>} placeholder="x" />);
    const trail = screen.getByTestId('trail');
    const well = trail.parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('inert');
  });

  it('accepts an array of slot nodes and renders one well per node', () => {
    render(
      <Input
        leadingSlot={[
          <span key="a" data-testid="a">
            A
          </span>,
          <span key="b" data-testid="b">
            B
          </span>,
        ]}
        placeholder="x"
      />,
    );
    const wellA = screen.getByTestId('a').parentElement as HTMLElement;
    const wellB = screen.getByTestId('b').parentElement as HTMLElement;
    expect(wellA).not.toBe(wellB);
    expect(wellA.getAttribute('data-slot-kind')).toBe('inert');
    expect(wellB.getAttribute('data-slot-kind')).toBe('inert');
  });

  it('auto-classifies a <button> child as an action well', () => {
    render(
      <Input
        trailingSlot={
          <button type="button" data-testid="b">
            Go
          </button>
        }
        placeholder="x"
      />,
    );
    const well = screen.getByTestId('b').parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('action');
  });

  it('auto-classifies a child with role="button" as an action well', () => {
    render(
      <Input
        trailingSlot={
          // biome-ignore lint/a11y/useFocusableInteractive: test fixture verifies auto-classification of role="button"
          // biome-ignore lint/a11y/useKeyWithClickEvents: test fixture verifies auto-classification of onClick
          // biome-ignore lint/a11y/useSemanticElements: test fixture intentionally uses span + role="button"
          <span role="button" data-testid="b" onClick={() => {}}>
            x
          </span>
        }
        placeholder="x"
      />,
    );
    const well = screen.getByTestId('b').parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('action');
  });

  it('auto-classifies a child with onClick as an action well', () => {
    render(
      <Input
        trailingSlot={
          // biome-ignore lint/a11y/useKeyWithClickEvents: test fixture verifies auto-classification of onClick
          <span data-testid="b" onClick={() => {}}>
            x
          </span>
        }
        placeholder="x"
      />,
    );
    const well = screen.getByTestId('b').parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('action');
  });

  it('variant="flat" collapses the wells and renders slots inline', () => {
    const { container } = render(
      <Input variant="flat" leadingSlot={<span data-testid="lead">@</span>} placeholder="x" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('data-variant')).toBe('flat');
    // In flat mode, slot content is NOT wrapped in a data-slot-kind well.
    const lead = screen.getByTestId('lead');
    expect(lead.parentElement?.getAttribute('data-slot-kind')).toBeNull();
  });

  it('clearable in multi-well renders clear as an action well', () => {
    render(<Input value="abc" onChange={() => {}} clearable />);
    const btn = screen.getByLabelText('Clear input');
    const well = btn.closest('[data-slot-kind]') as HTMLElement;
    expect(well).not.toBeNull();
    expect(well.getAttribute('data-slot-kind')).toBe('action');
  });
});
