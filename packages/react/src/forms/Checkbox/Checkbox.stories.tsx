import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Checkbox, type CheckboxState } from './Checkbox.js';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  parameters: { layout: 'padded' },
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['accent', 'neutral', 'success', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  args: {
    children: 'Accept terms',
    colorScheme: 'accent',
    size: 'md',
  },
};

export const Variants: Story = {
  name: 'ColorSchemes',
  render: () => (
    <Inline gap="4" align="center">
      <Checkbox defaultChecked colorScheme="accent">
        Accent
      </Checkbox>
      <Checkbox defaultChecked colorScheme="neutral">
        Neutral
      </Checkbox>
      <Checkbox defaultChecked colorScheme="success">
        Success
      </Checkbox>
      <Checkbox defaultChecked colorScheme="danger">
        Danger
      </Checkbox>
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="4" align="center">
      <Checkbox defaultChecked size="sm">
        Small
      </Checkbox>
      <Checkbox defaultChecked size="md">
        Medium
      </Checkbox>
      <Checkbox defaultChecked size="lg">
        Large
      </Checkbox>
    </Inline>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3">
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled + checked
      </Checkbox>
      <Checkbox invalid>Invalid</Checkbox>
      <Checkbox required>Required</Checkbox>
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [checked, setChecked] = useState<CheckboxState>(false);
      return (
        <Stack gap="3">
          <Checkbox checked={checked} onCheckedChange={setChecked}>
            Subscribe to newsletter
          </Checkbox>
          <Text size="sm">
            State: <strong>{String(checked)}</strong>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · click and Space toggle state',
  render: () => <Checkbox>Click me</Checkbox>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cb = canvas.getByRole('checkbox');
    await expect(cb).toHaveAttribute('data-state', 'unchecked');
    await userEvent.click(cb);
    await expect(cb).toHaveAttribute('data-state', 'checked');
    // Keyboard parity: focus + Space toggles back.
    cb.focus();
    await expect(cb).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(cb).toHaveAttribute('data-state', 'unchecked');
  },
};
