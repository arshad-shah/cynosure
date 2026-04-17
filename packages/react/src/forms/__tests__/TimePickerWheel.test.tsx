import { Time } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';
import { TimePickerWheel } from '../TimePicker/TimePickerWheel.js';

function renderWheel(ui: React.ReactElement, locale = 'en-US') {
  return render(<I18nProvider locale={locale}>{ui}</I18nProvider>);
}

describe('TimePickerWheel', () => {
  it('renders three columns when 12-hour cycle is active', () => {
    renderWheel(<TimePickerWheel value={new Time(9, 30)} onChange={() => {}} hourCycle={12} />);
    expect(screen.getByLabelText('Hour')).toBeInTheDocument();
    expect(screen.getByLabelText('Minute')).toBeInTheDocument();
    expect(screen.getByLabelText('Period')).toBeInTheDocument();
  });

  it('renders two columns in 24-hour cycle', () => {
    renderWheel(<TimePickerWheel value={new Time(13, 0)} onChange={() => {}} hourCycle={24} />);
    expect(screen.getByLabelText('Hour')).toBeInTheDocument();
    expect(screen.getByLabelText('Minute')).toBeInTheDocument();
    expect(screen.queryByLabelText('Period')).not.toBeInTheDocument();
  });

  it('falls back to a default time when value is null', () => {
    renderWheel(<TimePickerWheel value={null} onChange={() => {}} hourCycle={12} />);
    const hourCol = screen.getByLabelText('Hour');
    expect(hourCol.querySelector('[data-selected="true"]')?.textContent).toBe('12');
  });

  it('auto-detects hour cycle from locale', () => {
    renderWheel(<TimePickerWheel value={new Time(8, 0)} onChange={() => {}} />, 'en-GB');
    expect(screen.getByLabelText('Hour')).toBeInTheDocument();
  });

  it('snaps minutes to the configured step', () => {
    renderWheel(
      <TimePickerWheel
        value={new Time(10, 17)}
        onChange={() => {}}
        hourCycle={24}
        minuteStep={15}
      />,
    );
    const minuteCol = screen.getByLabelText('Minute');
    expect(minuteCol.querySelector('[data-selected="true"]')?.textContent).toBe('15');
  });

  it('reports a 24-hour pick directly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWheel(<TimePickerWheel value={new Time(10, 0)} onChange={onChange} hourCycle={24} />);
    await user.click(screen.getByLabelText('Hour').querySelectorAll('button')[14] as HTMLElement);
    expect(onChange).toHaveBeenCalledWith(new Time(14, 0, 0));
  });

  it('translates 12-hour AM picks (incl. midnight) to real hours', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWheel(<TimePickerWheel value={new Time(2, 0)} onChange={onChange} hourCycle={12} />);
    const hourButtons = screen.getByLabelText('Hour').querySelectorAll('button');
    await user.click(hourButtons[hourButtons.length - 1] as HTMLElement); // 12 → 0
    expect(onChange).toHaveBeenCalledWith(new Time(0, 0, 0));
  });

  it('translates 12-hour PM picks (incl. noon) to real hours', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWheel(<TimePickerWheel value={new Time(14, 0)} onChange={onChange} hourCycle={12} />);
    const hourButtons = screen.getByLabelText('Hour').querySelectorAll('button');
    await user.click(hourButtons[hourButtons.length - 1] as HTMLElement); // 12 PM → 12
    expect(onChange).toHaveBeenCalledWith(new Time(12, 0, 0));
    onChange.mockClear();
    await user.click(hourButtons[2] as HTMLElement); // 3 PM → 15
    expect(onChange).toHaveBeenCalledWith(new Time(15, 0, 0));
  });

  it('reports minute picks unchanged', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWheel(<TimePickerWheel value={new Time(10, 0)} onChange={onChange} hourCycle={24} />);
    await user.click(screen.getByLabelText('Minute').querySelectorAll('button')[5] as HTMLElement);
    expect(onChange).toHaveBeenCalledWith(new Time(10, 5, 0));
  });

  it('flips AM <-> PM when the period button changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWheel(<TimePickerWheel value={new Time(9, 0)} onChange={onChange} hourCycle={12} />);
    const periodButtons = screen.getByLabelText('Period').querySelectorAll('button');
    await user.click(periodButtons[1] as HTMLElement); // PM
    expect(onChange).toHaveBeenCalledWith(new Time(21, 0, 0));
  });

  it('skips period changes when already on the same period', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWheel(<TimePickerWheel value={new Time(9, 0)} onChange={onChange} hourCycle={12} />);
    const periodButtons = screen.getByLabelText('Period').querySelectorAll('button');
    await user.click(periodButtons[0] as HTMLElement); // already AM
    expect(onChange).not.toHaveBeenCalled();
  });
});
