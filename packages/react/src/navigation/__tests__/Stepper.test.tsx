import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Step, Stepper } from '../Stepper/index.js';

describe('Stepper', () => {
  it('derives step statuses from currentStep', () => {
    render(
      <Stepper currentStep={1}>
        <Step title="Account" />
        <Step title="Profile" />
        <Step title="Done" />
      </Stepper>,
    );
    const list = screen.getByRole('list');
    const steps = within(list)
      .getAllByRole('listitem')
      .filter((li) => li.getAttribute('data-status'));
    expect(steps[0]).toHaveAttribute('data-status', 'complete');
    expect(steps[1]).toHaveAttribute('data-status', 'active');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[2]).toHaveAttribute('data-status', 'pending');
  });

  it('respects an explicit status override', () => {
    render(
      <Stepper currentStep={0}>
        <Step title="A" />
        <Step title="B" status="error" />
      </Stepper>,
    );
    const steps = screen.getAllByRole('listitem').filter((li) => li.getAttribute('data-status'));
    expect(steps[1]).toHaveAttribute('data-status', 'error');
  });

  it('fires onStepChange when interactive and a completed step is clicked', () => {
    const onStepChange = vi.fn();
    render(
      <Stepper currentStep={2} interactive onStepChange={onStepChange}>
        <Step title="Account" />
        <Step title="Profile" />
        <Step title="Done" />
      </Stepper>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Account' }));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it('does not render a button for pending steps', () => {
    render(
      <Stepper currentStep={0} interactive onStepChange={() => {}}>
        <Step title="Account" />
        <Step title="Profile" />
      </Stepper>,
    );
    // Profile is pending, so it should be non-interactive.
    expect(screen.queryByRole('button', { name: 'Profile' })).not.toBeInTheDocument();
  });
});
