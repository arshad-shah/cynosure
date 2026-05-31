import { parseDate, today } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { DateValue } from 'react-aria-components';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Calendar, RangeCalendar } from './Calendar.js';

const meta: Meta<typeof Calendar> = {
  title: 'Forms/Calendar',
  component: Calendar,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Calendar>;

const TZ = 'UTC';
const TODAY = today(TZ);

export const Playground: Story = {
  args: {
    'aria-label': 'Event date',
    defaultValue: parseDate('2026-04-17'),
    visibleMonths: 1,
  },
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState<DateValue | null>(TODAY);
      return (
        <Stack gap="3">
          <Calendar aria-label="Event date" value={value} onChange={setValue} />
          <Text size="sm" color="fg.muted">
            Selected: {value?.toString() ?? 'none'}
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const DualMonth: Story = {
  args: {
    'aria-label': 'Event date',
    defaultValue: parseDate('2026-04-17'),
    visibleMonths: 2,
  },
};

export const Range: StoryObj<typeof RangeCalendar> = {
  render: () => (
    <RangeCalendar
      aria-label="Trip dates"
      defaultValue={{ start: parseDate('2026-04-12'), end: parseDate('2026-04-18') }}
    />
  ),
};

export const Interaction: Story = {
  name: 'Interaction · selecting a day updates the selection',
  args: {
    'aria-label': 'Event date',
    defaultValue: parseDate('2026-04-17'),
    visibleMonths: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dayButton = (label: RegExp): HTMLElement => canvas.getByRole('button', { name: label });

    // April 17, 2026 starts selected.
    const start = dayButton(/April 17, 2026/);
    await expect(start).toHaveAttribute('data-selected', 'true');

    // Click a different day in the same month.
    const target = dayButton(/April 20, 2026/);
    await expect(target).not.toHaveAttribute('data-selected');
    await userEvent.click(target);

    await waitFor(() => {
      expect(dayButton(/April 20, 2026/)).toHaveAttribute('data-selected', 'true');
    });
    // The previously-selected day is no longer selected.
    await expect(dayButton(/April 17, 2026/)).not.toHaveAttribute('data-selected');
  },
};
