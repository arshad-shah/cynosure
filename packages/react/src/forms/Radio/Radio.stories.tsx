import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { RadioGroup } from '../RadioGroup/RadioGroup.js';
import { Radio } from './Radio.js';

const meta: Meta<typeof Radio> = {
  title: 'Forms/Radio',
  component: Radio,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Radio>;

/**
 * `<Radio>` must live inside a `<RadioGroup>` so Radix can manage selection
 * and roving focus. These stories wrap each example in a minimal group.
 */

export const Playground: Story = {
  args: {
    value: 'one',
    children: 'Option',
    size: 'md',
  },
  render: (args) => (
    <RadioGroup defaultValue="one" aria-label="Example">
      <Radio {...args} />
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <RadioGroup defaultValue="md" aria-label="Sizes">
      <Inline gap="4" align="center">
        <Radio value="sm" size="sm">
          Small
        </Radio>
        <Radio value="md" size="md">
          Medium
        </Radio>
        <Radio value="lg" size="lg">
          Large
        </Radio>
      </Inline>
    </RadioGroup>
  ),
};

export const States: Story = {
  render: () => (
    <RadioGroup defaultValue="on" aria-label="States">
      <Stack gap="3">
        <Radio value="off">Unselected</Radio>
        <Radio value="on">Selected</Radio>
        <Radio value="disabled" disabled>
          Disabled
        </Radio>
        <Radio value="invalid" invalid>
          Invalid
        </Radio>
        <Radio value="required" required>
          Required
        </Radio>
      </Stack>
    </RadioGroup>
  ),
};

export const WithoutLabel: Story = {
  name: 'Bare control (no children)',
  render: () => (
    <RadioGroup defaultValue="b" aria-label="Bare">
      <Inline gap="3" align="center">
        <Radio value="a" aria-label="A" />
        <Radio value="b" aria-label="B" />
        <Radio value="c" aria-label="C" />
      </Inline>
    </RadioGroup>
  ),
};

export const DisabledMix: Story = {
  render: () => (
    <RadioGroup defaultValue="b" aria-label="Plan">
      <Stack gap="3">
        <Radio value="a">Free</Radio>
        <Radio value="b">Pro</Radio>
        <Radio value="c" disabled>
          Enterprise (contact sales)
        </Radio>
      </Stack>
    </RadioGroup>
  ),
};

export const LongLabel: Story = {
  render: () => (
    <RadioGroup defaultValue="y" aria-label="Backup">
      <Stack gap="3" width="360px">
        <Radio value="n">Never back up</Radio>
        <Radio value="y">
          Back up automatically every night at 03:00 — this is the recommended option for most users
          and can be changed later.
        </Radio>
      </Stack>
    </RadioGroup>
  ),
};

export const Tip: Story = {
  name: 'Tip — Radios must live inside a RadioGroup',
  render: () => (
    <Stack gap="2">
      <Text size="sm" color="fg.muted">
        See <strong>Forms/RadioGroup</strong> stories for orientation, controlled state, and
        FormField composition.
      </Text>
    </Stack>
  ),
};
