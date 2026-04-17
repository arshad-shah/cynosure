import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '../Switch/index.js';

describe('Switch', () => {
  it('toggles on click (uncontrolled)', () => {
    render(<Switch>on</Switch>);
    const control = screen.getByRole('switch');
    expect(control.getAttribute('data-state')).toBe('unchecked');
    fireEvent.click(control);
    expect(control.getAttribute('data-state')).toBe('checked');
  });

  it('fires onCheckedChange (controlled)', () => {
    const handle = vi.fn();
    render(
      <Switch checked={false} onCheckedChange={handle}>
        on
      </Switch>,
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(handle).toHaveBeenCalledWith(true);
  });

  it('toggles via keyboard space', async () => {
    const user = userEvent.setup();
    render(<Switch>on</Switch>);
    const control = screen.getByRole('switch');
    control.focus();
    await user.keyboard('[Space]');
    expect(control.getAttribute('data-state')).toBe('checked');
  });

  it('renders a label when children are passed', () => {
    render(<Switch>Enable notifications</Switch>);
    expect(screen.getByText('Enable notifications').closest('label')).not.toBeNull();
  });

  it('blocks interaction and exposes aria-busy while loading', () => {
    const handle = vi.fn();
    render(
      <Switch checked={false} onCheckedChange={handle} loading>
        Syncing
      </Switch>,
    );
    const control = screen.getByRole('switch');
    expect(control).toHaveAttribute('aria-busy', 'true');
    expect(control).toBeDisabled();
    fireEvent.click(control);
    expect(handle).not.toHaveBeenCalled();
  });

  it('flags the invalid state via data-invalid', () => {
    render(<Switch invalid>Opt in</Switch>);
    const control = screen.getByRole('switch');
    expect(control).toHaveAttribute('data-invalid', 'true');
  });
});
