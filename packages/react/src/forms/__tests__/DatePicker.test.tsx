import { parseDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
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
});

describe('TimePicker', () => {
  it('renders a time field with the given label', () => {
    const { container } = render(<TimePicker aria-label="Meeting time" />);
    const groups = container.querySelectorAll('[role="group"]');
    expect(groups.length).toBeGreaterThan(0);
  });
});
