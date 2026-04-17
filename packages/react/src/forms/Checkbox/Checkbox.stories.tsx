import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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

export const WithoutLabel: Story = {
  name: 'Without children — bare control',
  render: () => (
    <Inline gap="3" align="center">
      <Checkbox aria-label="Accept" />
      <Checkbox aria-label="Accept" defaultChecked />
      <Checkbox aria-label="Accept" indeterminate />
    </Inline>
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

export const IndeterminateParent: Story = {
  name: 'Indeterminate parent with children',
  render: () => {
    function Demo(): React.ReactElement {
      const [items, setItems] = useState<boolean[]>([true, false, true]);
      const allChecked = items.every(Boolean);
      const noneChecked = items.every((x) => !x);
      const parentState: CheckboxState = allChecked ? true : noneChecked ? false : 'indeterminate';

      const toggleAll = (next: CheckboxState): void => {
        setItems(items.map(() => next === true));
      };

      return (
        <Stack gap="2">
          <Checkbox checked={parentState} onCheckedChange={toggleAll}>
            Select all
          </Checkbox>
          <Stack gap="2" paddingLeft="5">
            {items.map((item, i) => (
              <Checkbox
                // biome-ignore lint/suspicious/noArrayIndexKey: static demo list.
                key={i}
                checked={item}
                onCheckedChange={(next) => {
                  setItems((prev) => prev.map((v, idx) => (idx === i ? next === true : v)));
                }}
              >
                Item {i + 1}
              </Checkbox>
            ))}
          </Stack>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [accepted, setAccepted] = useState(false);
      const invalid = !accepted;
      return (
        <Form>
          <Stack gap="4" width="360px">
            <FormField name="terms" invalid={invalid} required>
              <FormLabel>Terms</FormLabel>
              <FormControl>
                <Checkbox checked={accepted} onCheckedChange={(c) => setAccepted(c === true)}>
                  I agree to the terms of service
                </Checkbox>
              </FormControl>
              <FormDescription>You must accept the terms to continue.</FormDescription>
              <FormMessage>{invalid ? 'Please accept the terms.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};

export const LongLabel: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <Checkbox defaultChecked>
        I have read and agree to the terms of service, privacy policy, and the data processing
        agreement that will be sent to my registered email address.
      </Checkbox>
    </Stack>
  ),
};

export const ClickToggles: Story = {
  name: 'Interaction · click toggles state',
  render: () => <Checkbox>Click me</Checkbox>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cb = canvas.getByRole('checkbox');
    await expect(cb).toHaveAttribute('data-state', 'unchecked');
    await userEvent.click(cb);
    await expect(cb).toHaveAttribute('data-state', 'checked');
    await userEvent.click(cb);
    await expect(cb).toHaveAttribute('data-state', 'unchecked');
  },
};

export const KeyboardToggles: Story = {
  name: 'Interaction · space toggles focused control',
  render: () => <Checkbox>Focus me then press space</Checkbox>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cb = canvas.getByRole('checkbox');
    cb.focus();
    await expect(cb).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(cb).toHaveAttribute('data-state', 'checked');
  },
};
