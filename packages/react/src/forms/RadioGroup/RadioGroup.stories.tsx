import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Radio } from '../Radio/Radio.js';
import { RadioGroup } from './RadioGroup.js';

const meta: Meta<typeof RadioGroup> = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];

export const Playground: Story = {
  args: {
    defaultValue: 'pro',
    orientation: 'vertical',
    'aria-label': 'Plan',
  },
  render: (args) => (
    <RadioGroup {...args}>
      {PLANS.map((p) => (
        <Radio key={p.value} value={p.value}>
          {p.label}
        </Radio>
      ))}
    </RadioGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <RadioGroup defaultValue="pro" orientation="vertical" aria-label="Plan">
      {PLANS.map((p) => (
        <Radio key={p.value} value={p.value}>
          {p.label}
        </Radio>
      ))}
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="pro" orientation="horizontal" aria-label="Plan">
      {PLANS.map((p) => (
        <Radio key={p.value} value={p.value}>
          {p.label}
        </Radio>
      ))}
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState('pro');
      return (
        <Stack gap="3">
          <RadioGroup value={value} onValueChange={setValue} aria-label="Plan">
            {PLANS.map((p) => (
              <Radio key={p.value} value={p.value}>
                {p.label}
              </Radio>
            ))}
          </RadioGroup>
          <Text size="sm">
            Selected: <strong>{value}</strong>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const DisabledGroup: Story = {
  render: () => (
    <RadioGroup defaultValue="pro" disabled aria-label="Plan">
      {PLANS.map((p) => (
        <Radio key={p.value} value={p.value}>
          {p.label}
        </Radio>
      ))}
    </RadioGroup>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · select changes the group value',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('free');
      return (
        <Stack gap="3">
          <RadioGroup value={value} onValueChange={setValue} aria-label="Plan">
            {PLANS.map((p) => (
              <Radio key={p.value} value={p.value}>
                {p.label}
              </Radio>
            ))}
          </RadioGroup>
          <Text size="sm" data-testid="value">
            {value}
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const out = canvas.getByTestId('value');
    await expect(out).toHaveTextContent('free');
    await userEvent.click(canvas.getByRole('radio', { name: 'Pro' }));
    await expect(out).toHaveTextContent('pro');
    await expect(canvas.getByRole('radio', { name: 'Pro' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  },
};
