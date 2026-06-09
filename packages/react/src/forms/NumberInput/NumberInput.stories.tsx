import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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
import { NumberInput } from './NumberInput.js';

const meta: Meta<typeof NumberInput> = {
  title: 'Forms/NumberInput',
  component: NumberInput,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    minValue: { control: { type: 'number' } },
    maxValue: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    clearOnLongPress: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Playground: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    defaultValue: 0,
    step: 1,
  },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="240px">
      <NumberInput variant="outline" defaultValue={1} aria-label="Outline" />
      <NumberInput variant="filled" defaultValue={1} aria-label="Filled" />
      <NumberInput variant="ghost" defaultValue={1} aria-label="Ghost" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="240px">
      <NumberInput size="sm" defaultValue={1} aria-label="Small" />
      <NumberInput size="md" defaultValue={1} aria-label="Medium" />
      <NumberInput size="lg" defaultValue={1} aria-label="Large" />
    </Stack>
  ),
};

export const MinMaxStep: Story = {
  render: () => (
    <Stack gap="3" width="240px">
      <NumberInput defaultValue={5} minValue={0} maxValue={10} aria-label="0 to 10" />
      <NumberInput defaultValue={0} step={5} aria-label="Step by 5" />
      <NumberInput defaultValue={0.5} step={0.1} minValue={0} maxValue={1} aria-label="Fraction" />
    </Stack>
  ),
};

export const Affixes: Story = {
  name: 'Prefix / suffix slots',
  render: () => (
    <Stack gap="3" width="240px">
      <NumberInput defaultValue={256} suffix="px" aria-label="Width" />
      <NumberInput defaultValue={1200} prefix="$" aria-label="Amount" />
      <NumberInput defaultValue={3.5} step={0.1} suffix="kg" aria-label="Weight" />
      <NumberInput defaultValue={80} minValue={0} maxValue={100} suffix="%" aria-label="Opacity" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="240px">
      <NumberInput defaultValue={42} aria-label="Default" />
      <NumberInput defaultValue={42} isReadOnly aria-label="Read only" />
      <NumberInput defaultValue={42} isDisabled aria-label="Disabled" />
      <NumberInput defaultValue={-1} minValue={0} invalid aria-label="Invalid" />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState<number>(3);
      return (
        <Stack gap="3" width="240px">
          <NumberInput
            value={value}
            onChange={setValue}
            minValue={0}
            maxValue={10}
            aria-label="Controlled"
          />
          <Text size="sm">
            Value: <strong>{Number.isNaN(value) ? '—' : value}</strong>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const HoldToRepeat: Story = {
  name: 'Hold to repeat',
  render: () => (
    <Stack gap="3" width="240px">
      <NumberInput defaultValue={0} step={1} aria-label="Hold the + or − button" />
      <Text size="sm">
        Press and hold <strong>−</strong> or <strong>+</strong>. After a short delay the value
        repeats and accelerates (React Aria's built-in stepper behavior).
      </Text>
    </Stack>
  ),
};

export const LongPressClear: Story = {
  name: 'Long-press to clear',
  render: () => (
    <Stack gap="3" width="240px">
      <NumberInput defaultValue={42} minValue={0} clearOnLongPress aria-label="Long-press clears" />
      <Text size="sm">
        With <code>clearOnLongPress</code>, hold the value for ~500ms to reset it (to{' '}
        <code>minValue</code> when set, otherwise empty).
      </Text>
    </Stack>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · steppers and arrow keys change value',
  render: () => <NumberInput defaultValue={5} step={1} aria-label="Quantity" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });
    await expect(field).toHaveValue('5');

    // Stepper buttons.
    await userEvent.click(canvas.getByRole('button', { name: 'Increment' }));
    await expect(field).toHaveValue('6');
    await userEvent.click(canvas.getByRole('button', { name: 'Decrement' }));
    await expect(field).toHaveValue('5');

    // Arrow keys on the focused field.
    field.focus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(field).toHaveValue('7');
  },
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [qty, setQty] = useState<number>(0);
      const invalid = qty < 1;
      return (
        <Form>
          <Stack gap="4" width="360px">
            <FormField name="qty" invalid={invalid} required>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <NumberInput value={qty} onChange={setQty} minValue={0} maxValue={99} />
              </FormControl>
              <FormDescription>Between 1 and 99.</FormDescription>
              <FormMessage>{invalid ? 'At least one, please.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
