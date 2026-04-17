import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
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
import { Combobox, ComboboxEmpty, ComboboxItem, type ComboboxItemData } from './Combobox.js';

const meta: Meta<typeof Combobox> = {
  title: 'Forms/Combobox',
  component: Combobox,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    allowsCustomValue: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Combobox>;

const frameworks: ReadonlyArray<ComboboxItemData> = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular', disabled: true },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
  { value: 'lit', label: 'Lit' },
  { value: 'preact', label: 'Preact' },
];

export const Playground: Story = {
  args: {
    placeholder: 'Search frameworks…',
    variant: 'outline',
    size: 'md',
    items: frameworks,
    'aria-label': 'Framework',
  },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Combobox variant="outline" items={frameworks} placeholder="Outline" aria-label="Outline" />
      <Combobox variant="filled" items={frameworks} placeholder="Filled" aria-label="Filled" />
      <Combobox variant="ghost" items={frameworks} placeholder="Ghost" aria-label="Ghost" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Combobox size="sm" items={frameworks} placeholder="Small" aria-label="Small" />
      <Combobox size="md" items={frameworks} placeholder="Medium" aria-label="Medium" />
      <Combobox size="lg" items={frameworks} placeholder="Large" aria-label="Large" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Combobox items={frameworks} placeholder="Default" aria-label="Default" />
      <Combobox items={frameworks} placeholder="Disabled" disabled aria-label="Disabled" />
      <Combobox items={frameworks} placeholder="Invalid" invalid aria-label="Invalid" />
      <Combobox items={frameworks} placeholder="Required" required aria-label="Required" />
    </Stack>
  ),
};

export const WithEmptyState: Story = {
  name: 'Custom empty state',
  render: () => (
    <Combobox
      items={frameworks}
      placeholder="Try typing 'XYZ'"
      aria-label="Empty"
      emptyState={<ComboboxEmpty>No frameworks match your search.</ComboboxEmpty>}
      style={{ width: '320px' }}
    />
  ),
};

export const CustomValue: Story = {
  name: 'allowsCustomValue — accept values not in the list',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<string | null>(null);
      return (
        <Stack gap="3" width="320px">
          <Combobox
            items={frameworks}
            allowsCustomValue
            value={value}
            onValueChange={setValue}
            placeholder="Type anything…"
            aria-label="Custom value"
          />
          <Text size="sm" color="fg.muted">
            Value: <code>{JSON.stringify(value)}</code>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState<string | null>('react');
      const [input, setInput] = useState<string>('React');
      return (
        <Stack gap="3" width="320px">
          <Combobox
            items={frameworks}
            value={value}
            onValueChange={setValue}
            inputValue={input}
            onInputChange={setInput}
            aria-label="Framework"
          />
          <Inline gap="3">
            <Text size="sm" color="fg.muted">
              key: <code>{JSON.stringify(value)}</code>
            </Text>
            <Text size="sm" color="fg.muted">
              text: <code>{JSON.stringify(input)}</code>
            </Text>
          </Inline>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const AsyncOptions: Story = {
  name: 'Async loading options',
  render: () => {
    function AsyncDemo(): React.ReactElement {
      const [input, setInput] = useState('');
      const [items, setItems] = useState<ReadonlyArray<ComboboxItemData>>([]);
      const [loading, setLoading] = useState(false);

      useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const timer = setTimeout(() => {
          if (cancelled) return;
          const filter = input.trim().toLowerCase();
          const next = frameworks.filter((f) =>
            filter === '' ? true : String(f.label).toLowerCase().includes(filter),
          );
          setItems(next);
          setLoading(false);
        }, 400);
        return () => {
          cancelled = true;
          clearTimeout(timer);
        };
      }, [input]);

      return (
        <Stack gap="3" width="320px">
          <Combobox
            inputValue={input}
            onInputChange={setInput}
            items={items}
            placeholder="Search (simulated network)…"
            aria-label="Async"
            emptyState={<ComboboxEmpty>{loading ? 'Loading…' : 'No matches'}</ComboboxEmpty>}
          />
          <Text size="sm" color="fg.muted">
            Debounced 400 ms; results: <strong>{items.length}</strong>
          </Text>
        </Stack>
      );
    }
    return <AsyncDemo />;
  },
};

export const JSXChildren: Story = {
  name: 'JSX children (ComboboxItem)',
  render: () => (
    <Combobox placeholder="Pick a city" aria-label="City" style={{ width: '320px' }}>
      <ComboboxItem id="dub" textValue="Dublin">
        Dublin
      </ComboboxItem>
      <ComboboxItem id="cor" textValue="Cork">
        Cork
      </ComboboxItem>
      <ComboboxItem id="gal" textValue="Galway">
        Galway
      </ComboboxItem>
      <ComboboxItem id="lim" textValue="Limerick" isDisabled>
        Limerick (disabled)
      </ComboboxItem>
    </Combobox>
  ),
};

export const ManyOptions: Story = {
  render: () => {
    const many: ReadonlyArray<ComboboxItemData> = Array.from({ length: 120 }).map((_, i) => ({
      value: `item-${i}`,
      label: `Item ${i + 1}`,
    }));
    return (
      <Combobox
        items={many}
        placeholder="Search 120 items…"
        aria-label="Many"
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
          <Stack gap="4" width="340px">
            <FormField name="framework" invalid={invalid} required>
              <FormLabel>Framework</FormLabel>
              <FormControl>
                <Combobox
                  items={frameworks}
                  value={value}
                  onValueChange={setValue}
                  placeholder="Pick one"
                  aria-label="Framework"
                />
              </FormControl>
              <FormDescription>Type to filter; arrow keys to navigate.</FormDescription>
              <FormMessage>{invalid ? 'Please pick a framework.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
