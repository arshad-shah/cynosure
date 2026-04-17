import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tag } from '../Tag/index.js';

describe('Tag', () => {
  it('renders as a plain span when neither onClick nor onRemove provided', () => {
    const { container } = render(<Tag>Product</Tag>);
    expect(container.firstChild?.nodeName).toBe('SPAN');
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('renders as a button when onClick is set', () => {
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>Clickable</Tag>);
    const btn = screen.getByRole('button', { name: 'Clickable' });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('onRemove adds a labelled remove button', () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>JavaScript</Tag>);
    const remove = screen.getByRole('button', { name: 'Remove JavaScript' });
    fireEvent.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('Backspace/Delete triggers onRemove when the group is focused', () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Focus me</Tag>);
    const group = screen.getByRole('group', { name: 'Focus me' });
    fireEvent.keyDown(group, { key: 'Backspace' });
    expect(onRemove).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(group, { key: 'Delete' });
    expect(onRemove).toHaveBeenCalledTimes(2);
  });

  it('combines onClick with onRemove via nested buttons', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Tag onClick={onClick} onRemove={onRemove}>
        Both
      </Tag>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Both' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Both' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
