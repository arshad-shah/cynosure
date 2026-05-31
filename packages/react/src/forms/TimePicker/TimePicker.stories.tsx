import { Time, parseTime } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { TimeValue } from 'react-aria-components';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { TimePicker } from './TimePicker.js';

const meta: Meta<typeof TimePicker> = {
  title: 'Forms/TimePicker',
  component: TimePicker,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    granularity: { control: 'select', options: ['hour', 'minute', 'second'] },
    hourCycle: { control: 'select', options: [12, 24] },
  },
};
export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Playground: Story = {
  args: {
    label: 'Meeting time',
    defaultValue: new Time(9, 30),
    size: 'md',
    variant: 'outline',
  },
  render: (args) => (
    <div style={{ width: '240px' }}>
      <TimePicker {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="240px">
      <TimePicker label="Outline" variant="outline" defaultValue={new Time(9, 30)} />
      <TimePicker label="Filled" variant="filled" defaultValue={new Time(9, 30)} />
      <TimePicker label="Ghost" variant="ghost" defaultValue={new Time(9, 30)} />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="240px">
      <TimePicker label="Small" size="sm" defaultValue={new Time(9, 30)} />
      <TimePicker label="Medium" size="md" defaultValue={new Time(9, 30)} />
      <TimePicker label="Large" size="lg" defaultValue={new Time(9, 30)} />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="240px">
      <TimePicker label="Default" defaultValue={new Time(9, 30)} />
      <TimePicker label="Disabled" isDisabled defaultValue={new Time(9, 30)} />
      <TimePicker label="Read only" isReadOnly defaultValue={new Time(9, 30)} />
      <TimePicker label="Invalid" invalid defaultValue={new Time(9, 30)} />
      <TimePicker label="Empty" aria-label="Empty time" />
    </Stack>
  ),
};

export const Granularities: Story = {
  name: 'granularity (hour / minute / second)',
  render: () => (
    <Stack gap="3" width="260px">
      <TimePicker label="Hour" granularity="hour" defaultValue={new Time(9)} />
      <TimePicker label="Minute" granularity="minute" defaultValue={new Time(9, 30)} />
      <TimePicker label="Second" granularity="second" defaultValue={new Time(9, 30, 15)} />
    </Stack>
  ),
};

export const HourCycle: Story = {
  name: '12h vs 24h',
  render: () => (
    <Stack gap="3" width="260px">
      <TimePicker label="12-hour" hourCycle={12} defaultValue={parseTime('14:45')} />
      <TimePicker label="24-hour" hourCycle={24} defaultValue={parseTime('14:45')} />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function ControlledDemo(): React.ReactElement {
      const [value, setValue] = useState<TimeValue | null>(new Time(8, 0));
      return (
        <Stack gap="3" width="260px">
          <TimePicker label="Alarm" value={value} onChange={setValue} />
          <Text size="sm" color="fg.muted">
            Value: <code>{value ? value.toString() : 'null'}</code>
          </Text>
        </Stack>
      );
    }
    return <ControlledDemo />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · arrow keys change the time',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<TimeValue | null>(new Time(9, 30));
      return (
        <Stack gap="3" width="260px">
          <TimePicker label="Meeting time" value={value} onChange={setValue} hourCycle={24} />
          <Text size="sm" color="fg.muted">
            Value: <span data-testid="value">{value ? value.toString() : 'null'}</span>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('value')).toHaveTextContent('09:30');

    // The hour segment is an editable spinbutton; arrow keys step its value.
    const hour = canvas.getByRole('spinbutton', { name: /hour/i });
    hour.focus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      // 09 → 10, minutes unchanged.
      expect(canvas.getByTestId('value')).toHaveTextContent('10:30');
    });
  },
};
