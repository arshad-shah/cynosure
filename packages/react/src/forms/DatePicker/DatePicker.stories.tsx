import { parseDate, today } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { DateValue } from 'react-aria-components';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { LocaleProvider } from '../../theme/index.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
import { DatePicker } from './DatePicker.js';

const meta: Meta<typeof DatePicker> = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    granularity: { control: 'select', options: ['day', 'hour', 'minute', 'second'] },
  },
};
export default meta;
type Story = StoryObj<typeof DatePicker>;

const TZ = 'UTC';
const TODAY = today(TZ);

export const Playground: Story = {
  args: {
    label: 'Start date',
    defaultValue: parseDate('2026-04-17'),
    size: 'md',
    variant: 'outline',
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <DatePicker {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <DatePicker label="Outline" variant="outline" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Filled" variant="filled" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Ghost" variant="ghost" defaultValue={parseDate('2026-04-17')} />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <DatePicker label="Small" size="sm" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Medium" size="md" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Large" size="lg" defaultValue={parseDate('2026-04-17')} />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <DatePicker label="Default" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Disabled" isDisabled defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Read only" isReadOnly defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Invalid" invalid defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Empty" aria-label="Empty date" />
    </Stack>
  ),
};

export const MinMax: Story = {
  name: 'minValue / maxValue',
  render: () => (
    <div style={{ width: '320px' }}>
      <DatePicker
        label="Must fall within the next 30 days"
        minValue={TODAY}
        maxValue={TODAY.add({ days: 30 })}
        defaultValue={TODAY.add({ days: 7 })}
      />
    </div>
  ),
};

export const Granularity: Story = {
  name: 'granularity (day / minute)',
  render: () => (
    <Stack gap="3" width="360px">
      <DatePicker label="Day precision" granularity="day" defaultValue={parseDate('2026-04-17')} />
      <DatePicker label="Minute precision" granularity="minute" />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState<DateValue | null>(parseDate('2026-04-17'));
      return (
        <Stack gap="3" width="320px">
          <DatePicker label="Pick a date" value={value} onChange={setValue} />
          <Text size="sm" color="fg.muted">
            Value: <code>{value ? value.toString() : 'null'}</code>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <DatePicker label="Uncontrolled" defaultValue={parseDate('2026-04-17')} />
    </div>
  ),
};

export const Locales: Story = {
  name: 'Locale-aware formatting',
  render: () => (
    <Stack gap="4" width="360px">
      <LocaleProvider locale="en-IE">
        <DatePicker label="en-IE (Ireland)" defaultValue={parseDate('2026-04-17')} />
      </LocaleProvider>
      <LocaleProvider locale="en-US">
        <DatePicker label="en-US (United States)" defaultValue={parseDate('2026-04-17')} />
      </LocaleProvider>
      <LocaleProvider locale="de-DE">
        <DatePicker label="de-DE (Germany)" defaultValue={parseDate('2026-04-17')} />
      </LocaleProvider>
      <LocaleProvider locale="ja-JP">
        <DatePicker label="ja-JP (Japan)" defaultValue={parseDate('2026-04-17')} />
      </LocaleProvider>
    </Stack>
  ),
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<DateValue | null>(null);
      const invalid = value === null;
      return (
        <Form>
          <Stack gap="4" width="340px">
            <FormField name="dob" invalid={invalid} required>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <DatePicker value={value} onChange={setValue} aria-label="Date of birth" />
              </FormControl>
              <FormDescription>Use the calendar or type into the segments.</FormDescription>
              <FormMessage>{invalid ? 'Please choose a date.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
