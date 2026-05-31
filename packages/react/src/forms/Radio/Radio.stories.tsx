import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
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

export const Interaction: Story = {
  name: 'Interaction · clicking a radio selects it',
  render: () => (
    <RadioGroup defaultValue="off" aria-label="Power">
      <Stack gap="3">
        <Radio value="off">Off</Radio>
        <Radio value="on">On</Radio>
      </Stack>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const off = canvas.getByRole('radio', { name: 'Off' });
    const on = canvas.getByRole('radio', { name: 'On' });
    await expect(off).toHaveAttribute('aria-checked', 'true');
    await expect(on).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(on);
    await expect(on).toHaveAttribute('aria-checked', 'true');
    await expect(off).toHaveAttribute('aria-checked', 'false');
  },
};
