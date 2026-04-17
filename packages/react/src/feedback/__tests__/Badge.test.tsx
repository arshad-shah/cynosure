import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../Badge/index.js';

describe('Badge', () => {
  it('renders its children inside a span', () => {
    const { container } = render(<Badge colorScheme="success">New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('renders dot variant without content and hides from AT', () => {
    const { container } = render(<Badge dot colorScheme="danger" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.textContent).toBe('');
  });

  it('supports the leading icon slot', () => {
    render(
      <Badge icon={<span data-testid="lead">*</span>} colorScheme="info">
        Hello
      </Badge>,
    );
    expect(screen.getByTestId('lead')).toBeInTheDocument();
  });
});
