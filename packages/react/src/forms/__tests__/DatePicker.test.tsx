import { parseDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DatePicker } from '../DatePicker/index.js';
import { DateRangePicker } from '../DateRangePicker/index.js';
import { TimePicker } from '../TimePicker/index.js';

describe('DatePicker', () => {
  it('renders date segments and an open-calendar trigger', () => {
    render(<DatePicker aria-label="Start date" defaultValue={parseDate('2026-04-17')} />);
    expect(screen.getByRole('button', { name: /open calendar/i })).toBeInTheDocument();
  });

  it('can be marked invalid via the invalid prop', () => {
    const { container } = render(
      <DatePicker aria-label="Start date" invalid defaultValue={parseDate('2026-04-17')} />,
    );
    const group = container.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    expect(group).toHaveAttribute('data-invalid', 'true');
  });

  it('opens the calendar popover with the today footer link', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Start date" defaultValue={parseDate('2026-04-17')} />);
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(await screen.findByRole('button', { name: /go to today/i })).toBeInTheDocument();
    expect(screen.getByText(/today is/i)).toBeInTheDocument();
  });

  it('falls back to label as accessible name when aria-label is omitted', () => {
    render(<DatePicker label="Start" defaultValue={parseDate('2026-04-17')} />);
    expect(screen.getByRole('group', { name: 'Start' })).toBeInTheDocument();
  });
});

describe('DateRangePicker', () => {
  it('renders start and end segments', () => {
    render(
      <DateRangePicker
        aria-label="Stay"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-20') }}
      />,
    );
    expect(screen.getByRole('button', { name: /open calendar/i })).toBeInTheDocument();
  });

  it('opens to a single-month layout when visibleMonths=1', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Stay" visibleMonths={1} />);
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(await screen.findByRole('grid')).toBeInTheDocument();
  });

  it('marks the wrapper as readonly + disabled when those props are set', () => {
    const { container, rerender } = render(<DateRangePicker aria-label="Stay" isReadOnly />);
    expect(container.querySelector('[data-readonly="true"]')).not.toBeNull();
    rerender(<DateRangePicker aria-label="Stay" isDisabled />);
    expect(container.querySelector('[data-disabled="true"]')).not.toBeNull();
  });

  it('shows the Clear footer button when a range is committed', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        aria-label="Stay"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-20') }}
      />,
    );
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(await screen.findByRole('button', { name: /clear/i })).toBeInTheDocument();
  });
});

describe('TimePicker', () => {
  it('renders a time field with the given label', () => {
    const { container } = render(<TimePicker aria-label="Meeting time" />);
    const groups = container.querySelectorAll('[role="group"]');
    expect(groups.length).toBeGreaterThan(0);
  });
});
