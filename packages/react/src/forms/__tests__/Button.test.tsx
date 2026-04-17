import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/index.js';

describe('Button', () => {
  it('renders a <button> with type="button" by default', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('fires click handlers', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables clicks when `disabled`', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disables clicks and sets aria-busy when `loading`', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving…
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.getAttribute('data-loading')).toBe('true');
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('projects styles onto an anchor via asChild', () => {
    render(
      <Button asChild>
        <a href="/home">Home</a>
      </Button>,
    );
    const a = screen.getByRole('link', { name: 'Home' });
    expect(a.tagName).toBe('A');
    expect(a.getAttribute('href')).toBe('/home');
    // when asChild, no type="button" is forced on the anchor
    expect(a.getAttribute('type')).toBeNull();
  });

  it('forwards leftIcon and rightIcon as content', () => {
    render(
      <Button leftIcon={<span data-testid="l" />} rightIcon={<span data-testid="r" />}>
        Label
      </Button>,
    );
    expect(screen.getByTestId('l')).toBeInTheDocument();
    expect(screen.getByTestId('r')).toBeInTheDocument();
  });
});
