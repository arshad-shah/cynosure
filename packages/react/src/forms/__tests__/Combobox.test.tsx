import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Combobox, ComboboxItem } from '../Combobox/index.js';

describe('Combobox', () => {
  it('renders a combobox with the given label', () => {
    render(
      <Combobox aria-label="Framework">
        <ComboboxItem id="next">Next.js</ComboboxItem>
        <ComboboxItem id="remix">Remix</ComboboxItem>
      </Combobox>,
    );
    expect(screen.getByRole('combobox', { name: /framework/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open options/i })).toBeInTheDocument();
  });

  it('seeds the input with the default input value', () => {
    render(
      <Combobox aria-label="Framework" defaultInputValue="Next">
        <ComboboxItem id="next">Next.js</ComboboxItem>
      </Combobox>,
    );
    const input = screen.getByRole('combobox', { name: /framework/i }) as HTMLInputElement;
    expect(input.value).toBe('Next');
  });

  it('marks the combobox as disabled when the disabled prop is set', () => {
    render(
      <Combobox aria-label="Framework" disabled>
        <ComboboxItem id="next">Next.js</ComboboxItem>
      </Combobox>,
    );
    const input = screen.getByRole('combobox', { name: /framework/i });
    expect(input).toBeDisabled();
  });

  it('renders an items array as options', () => {
    render(
      <Combobox
        aria-label="Framework"
        items={[
          { value: 'next', label: 'Next.js' },
          { value: 'remix', label: 'Remix', disabled: true },
        ]}
      />,
    );
    expect(screen.getByRole('combobox', { name: /framework/i })).toBeInTheDocument();
  });

  it('forwards label as the accessible name when no aria-label is set', () => {
    render(<Combobox label="Framework" items={[{ value: 'a', label: 'A' }]} />);
    expect(screen.getByRole('combobox', { name: 'Framework' })).toBeInTheDocument();
  });

  it('marks the wrapper as invalid when invalid is set', () => {
    const { container } = render(
      <Combobox aria-label="Framework" invalid items={[{ value: 'a', label: 'A' }]} />,
    );
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
  });

  it('controlled inputValue stays in the input', () => {
    render(
      <Combobox aria-label="Framework" inputValue="abc" items={[{ value: 'a', label: 'A' }]} />,
    );
    const input = screen.getByRole('combobox', { name: /framework/i }) as HTMLInputElement;
    expect(input.value).toBe('abc');
  });

  it('honours required, custom placeholder, and a numeric label fallback', () => {
    render(
      <Combobox
        aria-label="Framework"
        required
        placeholder="Type something"
        items={[{ value: 'a', label: 42 as unknown as string }]}
      />,
    );
    const input = screen.getByRole('combobox', { name: /framework/i });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('placeholder', 'Type something');
  });
});
