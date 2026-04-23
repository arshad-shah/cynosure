import { parseDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Calendar, RangeCalendar } from '../Calendar/index.js';

describe('Calendar', () => {
  it('renders a grid with prev/next controls', () => {
    render(<Calendar aria-label="Event date" defaultValue={parseDate('2026-04-17')} />);
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders the custom footer slot', () => {
    render(
      <Calendar
        aria-label="Event date"
        defaultValue={parseDate('2026-04-17')}
        footer={<div data-testid="cal-footer">hello</div>}
      />,
    );
    expect(screen.getByTestId('cal-footer')).toHaveTextContent('hello');
  });

  it('renders two month grids when visibleMonths=2', () => {
    render(
      <Calendar aria-label="Event date" defaultValue={parseDate('2026-04-17')} visibleMonths={2} />,
    );
    expect(screen.getAllByRole('grid')).toHaveLength(2);
  });
});

describe('RangeCalendar', () => {
  it('renders two months by default', () => {
    render(<RangeCalendar aria-label="Trip dates" />);
    expect(screen.getAllByRole('grid')).toHaveLength(2);
  });

  it('collapses to one month when visibleMonths=1', () => {
    render(<RangeCalendar aria-label="Trip dates" visibleMonths={1} />);
    expect(screen.getAllByRole('grid')).toHaveLength(1);
  });
});
