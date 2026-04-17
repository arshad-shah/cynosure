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
import { Select, SelectItem, type SelectItemData, SelectSection } from './Select.js';

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

export const GroupedWithChildren: Story = {
  name: 'Grouped via SelectSection children',
  render: () => (
    <Select placeholder="Pick a plan" aria-label="Plan" style={{ width: '280px' }}>
      <SelectSection title="Personal">
        <SelectItem id="free">Free</SelectItem>
        <SelectItem id="pro">Pro</SelectItem>
      </SelectSection>
      <SelectSection title="Business">
        <SelectItem id="team">Team</SelectItem>
        <SelectItem id="enterprise">Enterprise</SelectItem>
      </SelectSection>
    </Select>
  ),
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

export const Uncontrolled: Story = {
  render: () => (
    <Select
      defaultValue="apple"
      items={fruits}
      aria-label="Fruit"
      placeholder="Pick"
      style={{ width: '280px' }}
    />
  ),
};

export const LongOptions: Story = {
  render: () => {
    const many: ReadonlyArray<SelectItemData> = Array.from({ length: 80 }).map((_, i) => ({
      value: `option-${i}`,
      label: `Option ${i + 1} — lorem ipsum dolor sit amet, consectetur`,
    }));
    return (
      <Select
        placeholder="Pick one of many"
        items={many}
        aria-label="Many options"
        style={{ width: '320px' }}
      />
    );
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
