import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Chip } from '../Chip/index.js';

describe('Chip', () => {
  it('exposes aria-pressed based on selected', () => {
    const { rerender } = render(<Chip selected={false}>React</Chip>);
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'false');
    rerender(<Chip selected>React</Chip>);
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelectedChange with the toggled value', () => {
    const onSelectedChange = vi.fn();
    render(
      <Chip selected={false} onSelectedChange={onSelectedChange}>
        Tag
      </Chip>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tag' }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it('renders an accessible remove button when onRemove is set', () => {
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>Vue</Chip>);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Vue' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('disabled chip does not toggle', () => {
    const onSelectedChange = vi.fn();
    render(
      <Chip disabled onSelectedChange={onSelectedChange}>
        Svelte
      </Chip>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Svelte' }));
    expect(onSelectedChange).not.toHaveBeenCalled();
  });
});
