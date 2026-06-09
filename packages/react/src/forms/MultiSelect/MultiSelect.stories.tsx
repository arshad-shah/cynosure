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

export const Overflow: Story = {
  name: 'Overflow — chips collapse to +N',
  render: () => (
    <Stack gap="3" width="260px">
      <MultiSelect
        items={tags}
        defaultValue={['design', 'engineering', 'marketing', 'support', 'sales']}
        aria-label="Many selected"
        placeholder="Pick teams…"
      />
      <Text size="sm" color="fg.muted">
        The trigger stays one row tall — chips that don't fit collapse into a<strong> +N</strong>{' '}
        badge.
      </Text>
    </Stack>
  ),
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

export const Interaction: Story = {
  name: 'Interaction · open dropdown, pick toggles a chip',
  render: () => (
    <MultiSelect
      items={tags}
      placeholder="Add department…"
      aria-label="Departments"
      style={{ width: '360px' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Departments' });
    // Clicking the trigger opens the dropdown (portals to document.body).
    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await expect(listbox).toBeInTheDocument();
    // Selecting an option adds it as a removable chip; the option stays in the
    // list marked selected, so it remains reachable to toggle off.
    await userEvent.click(within(document.body).getByRole('option', { name: 'Engineering' }));
    await expect(canvas.getByRole('button', { name: 'Remove Engineering' })).toBeInTheDocument();
    await waitFor(() =>
      expect(within(document.body).getByRole('option', { name: 'Engineering' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
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
              <FormDescription>
                Open to search and toggle; Backspace in the empty search removes the last chip.
              </FormDescription>
              <FormMessage>{invalid ? 'Pick at least one department.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
