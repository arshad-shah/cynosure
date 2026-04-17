import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
import { Rating } from './Rating.js';

const meta: Meta<typeof Rating> = {
  title: 'Forms/Rating',
  component: Rating,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    max: { control: { type: 'number', min: 3, max: 10, step: 1 } },
    allowHalf: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Rating>;

export const Playground: Story = {
  args: {
    defaultValue: 3,
    max: 5,
    size: 'md',
    label: 'Rating',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 60 }}>
          Small
        </Text>
        <Rating size="sm" defaultValue={3} label="Small" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 60 }}>
          Medium
        </Text>
        <Rating size="md" defaultValue={3} label="Medium" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 60 }}>
          Large
        </Text>
        <Rating size="lg" defaultValue={3} label="Large" />
      </Inline>
    </Stack>
  ),
};

export const Counts: Story = {
  name: 'Custom max (3 / 5 / 10)',
  render: () => (
    <Stack gap="3">
      <Rating max={3} defaultValue={2} label="3-star" />
      <Rating max={5} defaultValue={4} label="5-star (default)" />
      <Rating max={10} defaultValue={7} label="10-star" />
    </Stack>
  ),
};

export const HalfStars: Story = {
  name: 'allowHalf — 0.5 precision',
  render: () => (
    <Stack gap="3">
      <Rating allowHalf defaultValue={2.5} label="2.5 of 5" />
      <Rating allowHalf defaultValue={3.5} label="3.5 of 5" />
      <Rating allowHalf defaultValue={4.5} label="4.5 of 5" size="lg" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 90 }}>
          Default
        </Text>
        <Rating defaultValue={3} label="Default" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 90 }}>
          Disabled
        </Text>
        <Rating defaultValue={3} disabled label="Disabled" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 90 }}>
          Read only
        </Text>
        <Rating defaultValue={4} readOnly label="Read only" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 90 }}>
          Required
        </Text>
        <Rating required label="Required" />
      </Inline>
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function ControlledDemo(): React.ReactElement {
      const [value, setValue] = useState<number>(0);
      const label =
        value === 0
          ? 'No rating'
          : value <= 2
            ? 'Needs work'
            : value <= 3
              ? 'Average'
              : value <= 4
                ? 'Good'
                : 'Excellent';
      return (
        <Stack gap="3">
          <Rating value={value} onValueChange={setValue} allowHalf label="Feedback" />
          <Text size="sm">
            {value} / 5 — <strong>{label}</strong>
          </Text>
        </Stack>
      );
    }
    return <ControlledDemo />;
  },
};

export const WithRenderValue: Story = {
  name: 'renderValue — hover-aware trailing label',
  render: () => (
    <Stack gap="3">
      <Rating
        allowHalf
        defaultValue={3.5}
        label="Hover to preview"
        renderValue={(v, m, preview) => (
          <Text size="sm" color="fg.muted">
            {(preview ?? v).toFixed(1)} / {m}
          </Text>
        )}
      />
      <Rating
        defaultValue={4}
        label="Descriptive"
        renderValue={(v, _m, preview) => {
          const shown = preview ?? v;
          const labels = ['No rating', 'Needs work', 'Average', 'Good', 'Great', 'Excellent'];
          return (
            <Text size="sm" color="fg.muted">
              {labels[Math.round(shown)]}
            </Text>
          );
        }}
      />
    </Stack>
  ),
};

export const ClearOnRepeatClick: Story = {
  name: 'Click the current star again to clear',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<number>(3);
      return (
        <Stack gap="3">
          <Rating value={value} onValueChange={setValue} label="Clear by clicking selected star" />
          <Text size="sm" color="fg.muted">
            Current: <strong>{value}</strong>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Uncontrolled: Story = {
  render: () => <Rating defaultValue={4} label="Uncontrolled" />,
};

export const WithLabel: Story = {
  name: 'Accessible label',
  render: () => (
    <Stack gap="3">
      <Rating label="Food quality" defaultValue={5} />
      <Rating label="Service" defaultValue={3} />
      <Rating label="Value" defaultValue={4} />
    </Stack>
  ),
};

export const KeyboardDemo: Story = {
  name: 'Keyboard navigation',
  render: () => (
    <Stack gap="3">
      <Rating allowHalf defaultValue={3} label="Focus me and try ←/→/Home/End" />
      <Text size="sm" color="fg.muted">
        <code>←</code>/<code>↓</code> decrement, <code>→</code>/<code>↑</code> increment,{' '}
        <code>Home</code>/<code>End</code> jump to 0 / max.
      </Text>
    </Stack>
  ),
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<number>(0);
      const invalid = value === 0;
      return (
        <Form>
          <Stack gap="4" width="340px">
            <FormField name="score" invalid={invalid} required>
              <FormLabel>How was your experience?</FormLabel>
              <FormControl>
                <Rating value={value} onValueChange={setValue} allowHalf label="Score" />
              </FormControl>
              <FormDescription>Rate 0.5 – 5 stars.</FormDescription>
              <FormMessage>{invalid ? 'Please leave a rating.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
