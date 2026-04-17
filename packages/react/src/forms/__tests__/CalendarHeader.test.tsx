import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CalendarHeader } from '../Calendar/index.js';

describe('CalendarHeader', () => {
  it('renders prev and next buttons by default', () => {
    render(<CalendarHeader />);
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });

  it('hides the previous-month button when hidePrev is set', () => {
    render(<CalendarHeader hidePrev />);
    expect(screen.queryByRole('button', { name: /previous month/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });

  it('hides the next-month button when hideNext is set', () => {
    render(<CalendarHeader hideNext />);
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next month/i })).not.toBeInTheDocument();
  });

  it('hides both nav buttons when both flags are set', () => {
    render(<CalendarHeader hidePrev hideNext />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('still renders the structure when hideTitle is set', () => {
    const { container } = render(<CalendarHeader hideTitle />);
    expect(container.querySelector('h2, [role="heading"]')).toBeNull();
  });
});
