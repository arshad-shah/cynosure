import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../Checkbox/index.js';
import { CheckboxGroup } from '../CheckboxGroup/index.js';

describe('Checkbox', () => {
  it('renders a label wrapping the control when children are passed', () => {
    render(<Checkbox>Agree</Checkbox>);
    const label = screen.getByText('Agree');
    expect(label.closest('label')).not.toBeNull();
  });

  it('toggles on click (uncontrolled)', () => {
    render(<Checkbox>Agree</Checkbox>);
    const control = screen.getByRole('checkbox');
    expect(control.getAttribute('data-state')).toBe('unchecked');
    fireEvent.click(control);
    expect(control.getAttribute('data-state')).toBe('checked');
  });

  it('calls onCheckedChange (controlled)', () => {
    const handle = vi.fn();
    render(
      <Checkbox checked={false} onCheckedChange={handle}>
        x
      </Checkbox>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handle).toHaveBeenCalledWith(true);
  });

  it('renders the indeterminate state', () => {
    render(<Checkbox indeterminate>x</Checkbox>);
    const control = screen.getByRole('checkbox');
    expect(control.getAttribute('data-state')).toBe('indeterminate');
    expect(control.getAttribute('aria-checked')).toBe('mixed');
  });

  it('toggles with keyboard space', async () => {
    const user = userEvent.setup();
    render(<Checkbox>space</Checkbox>);
    const control = screen.getByRole('checkbox');
    control.focus();
    await user.keyboard('[Space]');
    expect(control.getAttribute('data-state')).toBe('checked');
  });
});

describe('CheckboxGroup', () => {
  it('propagates selection via shared value array', () => {
    const Harness = (): React.ReactElement => {
      const [value, setValue] = useState<string[]>([]);
      return (
        <CheckboxGroup value={value} onChange={setValue}>
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
        </CheckboxGroup>
      );
    };
    render(<Harness />);
    const [a, b] = screen.getAllByRole('checkbox');
    fireEvent.click(a as HTMLElement);
    fireEvent.click(b as HTMLElement);
    expect(a?.getAttribute('data-state')).toBe('checked');
    expect(b?.getAttribute('data-state')).toBe('checked');
    fireEvent.click(a as HTMLElement);
    expect(a?.getAttribute('data-state')).toBe('unchecked');
  });
});
