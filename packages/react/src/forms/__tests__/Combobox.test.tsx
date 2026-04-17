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
});
