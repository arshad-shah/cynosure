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
import { MultiSelect, type MultiSelectItemData } from './MultiSelect.js';

const meta: Meta<typeof MultiSelect> = {
  title: 'Forms/MultiSelect',
  component: MultiSelect,
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
type Story = StoryObj<typeof MultiSelect>;

const tags: ReadonlyArray<MultiSelectItemData> = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Support' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'ops', label: 'Operations' },
  { value: 'legal', label: 'Legal', disabled: true },
];

export const Playground: Story = {
  args: {
    items: tags,
    placeholder: 'Add department…',
    variant: 'outline',
    size: 'md',
    'aria-label': 'Departments',
  },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <MultiSelect
        variant="outline"
        items={tags}
        placeholder="Outline"
        aria-label="Outline"
        defaultValue={['design']}
      />
      <MultiSelect
        variant="filled"
        items={tags}
        placeholder="Filled"
        aria-label="Filled"
        defaultValue={['design', 'engineering']}
      />
      <MultiSelect
        variant="ghost"
        items={tags}
        placeholder="Ghost"
        aria-label="Ghost"
        defaultValue={['marketing']}
      />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <MultiSelect
        size="sm"
        items={tags}
        placeholder="Small"
        aria-label="Small"
        defaultValue={['design']}
      />
      <MultiSelect
        size="md"
        items={tags}
        placeholder="Medium"
        aria-label="Medium"
        defaultValue={['design', 'engineering']}
      />
      <MultiSelect
        size="lg"
        items={tags}
        placeholder="Large"
        aria-label="Large"
        defaultValue={['design', 'engineering', 'marketing']}
      />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <MultiSelect items={tags} placeholder="Default" aria-label="Default" />
      <MultiSelect
        items={tags}
        placeholder="Disabled"
        disabled
        defaultValue={['design']}
        aria-label="Disabled"
      />
      <MultiSelect
        items={tags}
        placeholder="Invalid"
        invalid
        defaultValue={['design']}
        aria-label="Invalid"
      />
      <MultiSelect items={tags} placeholder="Required" required aria-label="Required" />
    </Stack>
  ),
};

export const MaxSelected: Story = {
  name: 'maxSelected — caps the count',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<string[]>(['design']);
      return (
        <Stack gap="3" width="360px">
          <MultiSelect
            items={tags}
            value={value}
            onValueChange={setValue}
            maxSelected={3}
            placeholder="Pick up to 3…"
            aria-label="Max 3"
          />
          <Text size="sm" color="fg.muted">
            Selected {value.length} / 3
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Controlled: Story = {
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<string[]>(['engineering', 'design']);
      return (
        <Stack gap="3" width="360px">
          <MultiSelect
            items={tags}
            value={value}
            onValueChange={setValue}
            placeholder="Add departments…"
            aria-label="Departments"
          />
          <Inline gap="2">
            <Text size="sm" color="fg.muted">
              Value: <code>{JSON.stringify(value)}</code>
            </Text>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <MultiSelect
      items={tags}
      defaultValue={['engineering', 'design']}
      placeholder="Add more…"
      aria-label="Departments"
      style={{ width: '360px' }}
    />
  ),
};

export const CustomEmptyState: Story = {
  render: () => (
    <MultiSelect
      items={tags}
      placeholder="Try typing 'zzz'"
      aria-label="Empty state"
      emptyState="Nothing matches. Try a different term."
      style={{ width: '360px' }}
    />
  ),
};

export const ManyItems: Story = {
  render: () => {
    const many: ReadonlyArray<MultiSelectItemData> = Array.from({ length: 80 }).map((_, i) => ({
      value: `tag-${i}`,
      label: `Tag ${i + 1}`,
    }));
    return (
      <MultiSelect
        items={many}
        placeholder="Pick tags (80 total)…"
        aria-label="Many tags"
        style={{ width: '380px' }}
      />
    );
  },
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<string[]>([]);
      const invalid = value.length === 0;
      return (
        <Form>
          <Stack gap="4" width="380px">
            <FormField name="departments" invalid={invalid} required>
              <FormLabel>Departments</FormLabel>
              <FormControl>
                <MultiSelect
                  items={tags}
                  value={value}
                  onValueChange={setValue}
                  placeholder="Add at least one…"
                  aria-label="Departments"
                />
              </FormControl>
              <FormDescription>Backspace with an empty input removes the last tag.</FormDescription>
              <FormMessage>{invalid ? 'Pick at least one department.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
