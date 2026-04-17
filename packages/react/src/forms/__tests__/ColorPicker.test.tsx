import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ColorPicker } from '../ColorPicker/index.js';

describe('ColorPicker', () => {
  it('renders the trigger with the default label', () => {
    render(<ColorPicker defaultValue="#ff0000" />);
    expect(screen.getByRole('button', { name: /pick a color/i })).toBeInTheDocument();
  });

  it('shows a custom string label inside the trigger', () => {
    render(<ColorPicker label="Brand colour" defaultValue="#00ff00" />);
    expect(screen.getByRole('button', { name: /brand colour/i })).toBeInTheDocument();
    expect(screen.getByText('Brand colour')).toBeInTheDocument();
  });

  it('falls back to the default aria-label for non-string labels', () => {
    render(<ColorPicker label={<span>Pick</span>} defaultValue="#0000ff" />);
    expect(screen.getByRole('button', { name: /pick a color/i })).toBeInTheDocument();
  });

  it('opens the popover and renders the default content on click', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#abcdef" />);
    await user.click(screen.getByRole('button', { name: /pick a color/i }));
    expect(await screen.findByRole('dialog', { name: /color picker/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/hex value/i)).toBeInTheDocument();
  });

  it('renders custom popover children when provided', async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker defaultValue="#123456">
        <div data-testid="custom-content">custom</div>
      </ColorPicker>,
    );
    await user.click(screen.getByRole('button', { name: /pick a color/i }));
    expect(await screen.findByTestId('custom-content')).toBeInTheDocument();
  });
});
