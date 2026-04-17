import { type CalendarDate, parseDate, today } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { LocaleProvider } from '../../theme/index.js';
import { Text } from '../../typography/Text/Text.js';
import { Button } from '../Button/Button.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
import { DateRangePicker } from './DateRangePicker.js';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Forms/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof DateRangePicker>;

const TZ = 'UTC';
const TODAY = today(TZ);

type Range = { start: CalendarDate; end: CalendarDate } | null;
type OnChange = (
  value: {
    start: import('@internationalized/date').DateValue;
    end: import('@internationalized/date').DateValue;
  } | null,
) => void;
const asOnChange =
  (set: (v: Range) => void): OnChange =>
  (value) => {
    if (value === null) {
      set(null);
      return;
    }
    set({ start: value.start as CalendarDate, end: value.end as CalendarDate });
  };

export const Playground: Story = {
  args: {
    label: 'Stay',
    defaultValue: { start: parseDate('2026-04-17'), end: parseDate('2026-04-22') },
    size: 'md',
    variant: 'outline',
  },
  render: (args) => (
    <div style={{ width: '380px' }}>
      <DateRangePicker {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="380px">
      <DateRangePicker
        label="Outline"
        variant="outline"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
      <DateRangePicker
        label="Filled"
        variant="filled"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
      <DateRangePicker
        label="Ghost"
        variant="ghost"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="380px">
      <DateRangePicker
        label="Small"
        size="sm"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
      <DateRangePicker
        label="Medium"
        size="md"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
      <DateRangePicker
        label="Large"
        size="lg"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="380px">
      <DateRangePicker
        label="Default"
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
      <DateRangePicker
        label="Disabled"
        isDisabled
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
      <DateRangePicker
        label="Read only"
        isReadOnly
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
      <DateRangePicker
        label="Invalid"
        invalid
        defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
      />
      <DateRangePicker label="Empty" aria-label="Empty range" />
    </Stack>
  ),
};

export const BoundedToFuture: Story = {
  name: 'minValue = today',
  render: () => (
    <div style={{ width: '380px' }}>
      <DateRangePicker
        label="Future bookings only"
        minValue={TODAY}
        defaultValue={{ start: TODAY.add({ days: 1 }), end: TODAY.add({ days: 5 }) }}
      />
    </div>
  ),
};

export const Presets: Story = {
  name: 'Preset ranges (controlled + clear)',
  render: () => {
    function PresetsDemo(): React.ReactElement {
      const [value, setValue] = useState<Range>({
        start: parseDate('2026-04-17'),
        end: parseDate('2026-04-22'),
      });
      const setDays = (n: number) => {
        const start = TODAY as CalendarDate;
        setValue({ start, end: start.add({ days: n - 1 }) });
      };
      return (
        <Stack gap="3" width="420px">
          <DateRangePicker label="Range" value={value} onChange={asOnChange(setValue)} />
          <Inline gap="2">
            <Button size="sm" variant="outline" onClick={() => setDays(7)}>
              Next 7 days
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDays(14)}>
              Next 14 days
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDays(30)}>
              Next 30 days
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setValue(null)}>
              Clear
            </Button>
          </Inline>
          <Text size="sm" color="fg.muted">
            Value:{' '}
            <code>{value ? `${value.start.toString()} → ${value.end.toString()}` : 'null'}</code>
          </Text>
        </Stack>
      );
    }
    return <PresetsDemo />;
  },
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState<Range>({
        start: parseDate('2026-04-17'),
        end: parseDate('2026-04-22'),
      });
      return (
        <Stack gap="3" width="380px">
          <DateRangePicker label="Range" value={value} onChange={asOnChange(setValue)} />
          <Text size="sm" color="fg.muted">
            Value:{' '}
            <code>{value ? `${value.start.toString()} → ${value.end.toString()}` : 'null'}</code>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const Locales: Story = {
  name: 'Locale-aware segments',
  render: () => (
    <Stack gap="4" width="420px">
      <LocaleProvider locale="en-IE">
        <DateRangePicker
          label="en-IE"
          defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
        />
      </LocaleProvider>
      <LocaleProvider locale="fr-FR">
        <DateRangePicker
          label="fr-FR"
          defaultValue={{ start: parseDate('2026-04-17'), end: parseDate('2026-04-22') }}
        />
      </LocaleProvider>
    </Stack>
  ),
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<Range>(null);
      const invalid = value === null;
      return (
        <Form>
          <Stack gap="4" width="400px">
            <FormField name="trip" invalid={invalid} required>
              <FormLabel>Trip dates</FormLabel>
              <FormControl>
                <DateRangePicker
                  value={value}
                  onChange={asOnChange(setValue)}
                  aria-label="Trip dates"
                />
              </FormControl>
              <FormDescription>Select the arrival and departure days.</FormDescription>
              <FormMessage>{invalid ? 'Please pick a range.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
