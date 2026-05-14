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

  it('opens the popover and renders the format toggle on click', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#abcdef" />);
    await user.click(screen.getByRole('button', { name: /pick a color/i }));
    expect(await screen.findByRole('dialog', { name: /color picker/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /color format/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/hex value/i)).toBeInTheDocument();
  });

  it('renders inline body without a trigger when variant="inline"', () => {
    render(<ColorPicker variant="inline" defaultValue="#123456" />);
    expect(screen.queryByRole('button', { name: /pick a color/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/hex value/i)).toBeInTheDocument();
  });

  it('renders an alpha slider when alpha={true}', () => {
    render(<ColorPicker variant="inline" defaultValue="#123456" alpha />);
    expect(screen.getByRole('slider', { name: /alpha/i })).toBeInTheDocument();
  });

  it('renders the provided swatch presets', () => {
    render(
      <ColorPicker variant="inline" defaultValue="#ef4444" swatches={['#ef4444', '#10b981']} />,
    );
    expect(screen.getByRole('button', { name: /use color #ef4444/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use color #10b981/i })).toBeInTheDocument();
  });

  it('switches to per-channel cells when RGB is selected', async () => {
    const user = userEvent.setup();
    render(<ColorPicker variant="inline" defaultValue="#10b981" />);
    // Default starts in hex: one cell with label "Hex value".
    expect(screen.getByLabelText(/hex value/i)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /rgb/i }));
    expect(screen.getByLabelText(/^red$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^green$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^blue$/i)).toBeInTheDocument();
  });

  it('switches to H/S/L cells when HSL is selected', async () => {
    const user = userEvent.setup();
    render(<ColorPicker variant="inline" defaultValue="#10b981" />);
    await user.click(screen.getByRole('radio', { name: /hsl/i }));
    // The hue slider also has aria-label "Hue", so scope to textbox inputs.
    expect(screen.getByRole('textbox', { name: /^hue$/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^saturation$/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^lightness$/i })).toBeInTheDocument();
  });

  it('shows an alpha cell when alpha={true} in RGB mode', async () => {
    const user = userEvent.setup();
    render(<ColorPicker variant="inline" defaultValue="#10b981" alpha />);
    await user.click(screen.getByRole('radio', { name: /rgb/i }));
    // The alpha slider also has aria-label "Alpha", so scope to textbox inputs.
    expect(screen.getByRole('textbox', { name: /^alpha$/i })).toBeInTheDocument();
  });

  it('accepts size="sm" | "md" | "lg" without crashing', () => {
    render(<ColorPicker variant="inline" size="sm" defaultValue="#123456" />);
    render(<ColorPicker variant="inline" size="lg" defaultValue="#123456" />);
    expect(screen.getAllByLabelText(/hex value/i)).toHaveLength(2);
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

  it('renders the hex value in the hero strip (inline variant)', () => {
    render(<ColorPicker variant="inline" defaultValue="#6c8cff" />);
    expect(screen.getByTestId('color-picker-hero-hex')).toHaveTextContent('#6C8CFF');
  });

  it('updates the hero readout when the format changes to RGB', async () => {
    const user = userEvent.setup();
    render(<ColorPicker variant="inline" defaultValue="#6c8cff" />);
    await user.click(screen.getByRole('radio', { name: /rgb/i }));
    expect(screen.getByTestId('color-picker-hero-readout')).toHaveTextContent(
      /rgb\(108,\s*140,\s*255\)/,
    );
  });

  it('shows rgba in the hero readout when alpha is enabled', async () => {
    const user = userEvent.setup();
    render(<ColorPicker variant="inline" defaultValue="#6c8cff" alpha />);
    await user.click(screen.getByRole('radio', { name: /rgb/i }));
    expect(screen.getByTestId('color-picker-hero-readout')).toHaveTextContent(
      /rgba\(108,\s*140,\s*255,\s*1\)/,
    );
  });

  it('shows a labelled saved-colors section with count', () => {
    render(
      <ColorPicker
        variant="inline"
        defaultValue="#ef4444"
        swatches={['#ef4444', '#10b981']}
        onSwatchesChange={() => {}}
      />,
    );
    expect(screen.getByText(/saved colors · 2 of 12/i)).toBeInTheDocument();
  });

  it('renders the save-current affordance inside the swatch grid', () => {
    render(
      <ColorPicker
        variant="inline"
        defaultValue="#123456"
        swatches={['#ef4444', '#10b981']}
        onSwatchesChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: /save current color to swatches/i }),
    ).toBeInTheDocument();
  });

  it('marks the active swatch tile when current colour matches', () => {
    render(
      <ColorPicker variant="inline" defaultValue="#10b981" swatches={['#ef4444', '#10b981']} />,
    );
    const tile = screen.getByRole('button', { name: /use color #10b981/i });
    expect(tile).toHaveAttribute('data-active', 'true');
  });
});
