import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
import { Select, SelectItem, type SelectItemData } from './Select.js';

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Select>;

const fruits: ReadonlyArray<SelectItemData> = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian', disabled: true },
  { value: 'elderberry', label: 'Elderberry' },
];

const grouped: ReadonlyArray<SelectItemData> = [
  { value: 'apple', label: 'Apple', section: 'Fruits' },
  { value: 'banana', label: 'Banana', section: 'Fruits' },
  { value: 'cherry', label: 'Cherry', section: 'Fruits' },
  { value: 'carrot', label: 'Carrot', section: 'Vegetables' },
  { value: 'potato', label: 'Potato', section: 'Vegetables' },
  { value: 'pepper', label: 'Pepper', section: 'Vegetables' },
];

export const Playground: Story = {
  args: {
    placeholder: 'Pick a fruit',
    variant: 'outline',
    size: 'md',
    items: fruits,
    'aria-label': 'Favourite fruit',
  },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="280px">
      <Select variant="outline" placeholder="Outline" items={fruits} aria-label="Outline" />
      <Select variant="filled" placeholder="Filled" items={fruits} aria-label="Filled" />
      <Select variant="ghost" placeholder="Ghost" items={fruits} aria-label="Ghost" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="280px">
      <Select size="sm" placeholder="Small" items={fruits} aria-label="Small" />
      <Select size="md" placeholder="Medium" items={fruits} aria-label="Medium" />
      <Select size="lg" placeholder="Large" items={fruits} aria-label="Large" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="280px">
      <Select placeholder="Default" items={fruits} aria-label="Default" />
      <Select placeholder="Disabled" disabled items={fruits} aria-label="Disabled" />
      <Select placeholder="Invalid" invalid items={fruits} aria-label="Invalid" />
      <Select placeholder="Required" required items={fruits} aria-label="Required" />
      <Select
        placeholder="With default"
        defaultValue="banana"
        items={fruits}
        aria-label="With default"
      />
    </Stack>
  ),
};

export const WithChildrenItems: Story = {
  name: 'JSX children (SelectItem)',
  render: () => (
    <Select placeholder="Pick a role" aria-label="Role" style={{ width: '280px' }}>
      <SelectItem id="admin">Admin</SelectItem>
      <SelectItem id="editor">Editor</SelectItem>
      <SelectItem id="viewer">Viewer</SelectItem>
      <SelectItem id="guest" isDisabled>
        Guest (disabled)
      </SelectItem>
    </Select>
  ),
};

export const Grouped: Story = {
  name: 'Grouped by section',
  render: () => (
    <Select
      placeholder="Pick an item"
      items={grouped}
      aria-label="Produce"
      style={{ width: '280px' }}
    />
  ),
};

export const Interaction: Story = {
  name: 'Interaction · open listbox, pick an option',
  render: () => (
    <Select
      placeholder="Pick a fruit"
      items={fruits}
      aria-label="Fruit"
      style={{ width: '280px' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Pick a fruit/i });
    await userEvent.click(trigger);
    // The listbox portals to document.body.
    const listbox = await within(document.body).findByRole('listbox');
    await expect(listbox).toBeInTheDocument();
    // Picking an option closes the popover and updates the trigger label.
    await userEvent.click(within(document.body).getByRole('option', { name: 'Banana' }));
    await waitFor(() =>
      expect(within(document.body).queryByRole('listbox')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveTextContent('Banana');
  },
};

export const Controlled: Story = {
  render: () => {
    function ControlledDemo(): React.ReactElement {
      const [value, setValue] = useState<string | null>('cherry');
      return (
        <Stack gap="3" width="280px">
          <Select
            value={value}
            onValueChange={setValue}
            items={fruits}
            aria-label="Fruit"
            placeholder="Pick a fruit"
          />
          <Inline gap="2">
            <Text size="sm" color="fg.muted">
              Value: <code>{JSON.stringify(value)}</code>
            </Text>
          </Inline>
        </Stack>
      );
    }
    return <ControlledDemo />;
  },
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<string | null>(null);
      const invalid = value === null;
      return (
        <Form>
          <Stack gap="4" width="320px">
            <FormField name="role" invalid={invalid} required>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select
                  value={value}
                  onValueChange={setValue}
                  placeholder="Choose a role"
                  aria-label="Role"
                >
                  <SelectItem id="admin">Admin</SelectItem>
                  <SelectItem id="editor">Editor</SelectItem>
                  <SelectItem id="viewer">Viewer</SelectItem>
                </Select>
              </FormControl>
              <FormDescription>Controls which actions the user can perform.</FormDescription>
              <FormMessage>{invalid ? 'Please choose a role.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
