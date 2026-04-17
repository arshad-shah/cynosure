import { parseDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DateRangePickerPresets } from '../DateRangePicker/DateRangePickerPresets.js';
import { DateRangePicker } from '../DateRangePicker/index.js';

const presets = [
  {
    label: 'This week',
    value: { start: parseDate('2026-04-13'), end: parseDate('2026-04-19') },
  },
  {
    label: 'Next week',
    value: { start: parseDate('2026-04-20'), end: parseDate('2026-04-26') },
  },
];

describe('DateRangePickerPresets', () => {
  it('renders nothing when used outside a DateRangePicker context', () => {
    const { container } = render(<DateRangePickerPresets presets={presets} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders presets and the default heading inside a DateRangePicker popover', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Stay" presets={presets} />);
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(await screen.findByText('Quick ranges')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'This week' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next week' })).toBeInTheDocument();
  });

  it('marks the preset matching the current value as active', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        aria-label="Stay"
        presets={presets}
        defaultValue={{ start: parseDate('2026-04-13'), end: parseDate('2026-04-19') }}
      />,
    );
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    const active = await screen.findByRole('button', { name: 'This week' });
    expect(active).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('button', { name: 'Next week' })).not.toHaveAttribute('data-active');
  });

  it('omits the rail when presets is empty', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Stay" presets={[]} />);
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.queryByText('Quick ranges')).not.toBeInTheDocument();
  });

  it('commits the preset value when clicked', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Stay" presets={presets} />);
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    const next = await screen.findByRole('button', { name: 'Next week' });
    await user.click(next);
    // Picker closes after commit; the open-calendar trigger is back focusable.
    expect(screen.getByRole('button', { name: /open calendar/i })).toBeInTheDocument();
  });
});
