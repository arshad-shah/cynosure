import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Fieldset } from '../Fieldset/Fieldset.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
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

export const PartiallyDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="free" aria-label="Plan">
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team" disabled>
        Team (contact sales)
      </Radio>
    </RadioGroup>
  ),
};

export const InsideFieldset: Story = {
  name: 'With <Fieldset> + legend',
  render: () => (
    <Fieldset legend="Choose your plan">
      <RadioGroup defaultValue="pro">
        {PLANS.map((p) => (
          <Radio key={p.value} value={p.value}>
            {p.label}
          </Radio>
        ))}
      </RadioGroup>
    </Fieldset>
  ),
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<string>('');
      const invalid = value === '';
      return (
        <Form>
          <Stack gap="4" width="360px">
            <FormField name="plan" invalid={invalid} required>
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <RadioGroup value={value} onValueChange={setValue}>
                  {PLANS.map((p) => (
                    <Radio key={p.value} value={p.value}>
                      {p.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>You can upgrade later.</FormDescription>
              <FormMessage>{invalid ? 'Pick a plan to continue.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
