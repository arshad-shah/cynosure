import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
import { SearchInput } from './SearchInput.js';

const meta: Meta<typeof SearchInput> = {
  title: 'Forms/SearchInput',
  component: SearchInput,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    debounceMs: { control: { type: 'number', min: 0, step: 50 } },
  },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Playground: Story = {
  args: {
    placeholder: 'Search…',
    variant: 'outline',
    size: 'md',
    debounceMs: 200,
  },
  render: (args) => (
    <div style={{ width: '360px' }}>
      <SearchInput {...args} aria-label="Search" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <SearchInput variant="outline" placeholder="Outline" aria-label="Outline" />
      <SearchInput variant="filled" placeholder="Filled" aria-label="Filled" />
      <SearchInput variant="ghost" placeholder="Ghost" aria-label="Ghost" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <SearchInput size="sm" placeholder="Small" aria-label="Small" />
      <SearchInput size="md" placeholder="Medium" aria-label="Medium" />
      <SearchInput size="lg" placeholder="Large" aria-label="Large" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <SearchInput placeholder="Default" aria-label="Default" />
      <SearchInput placeholder="Disabled" disabled aria-label="Disabled" />
      <SearchInput placeholder="Read only" defaultValue="lorem" readOnly aria-label="Read only" />
      <SearchInput placeholder="Invalid" invalid aria-label="Invalid" />
      <SearchInput placeholder="Required" required aria-label="Required" />
    </Stack>
  ),
};

export const Clearable: Story = {
  name: 'Clearable — clear button + Escape',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('react aria components');
      return (
        <Stack gap="3" width="360px">
          <SearchInput value={value} onChange={setValue} aria-label="Search" />
          <Text size="sm" color="fg.muted">
            Value: <code>{JSON.stringify(value)}</code>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const DebouncedSearch: Story = {
  name: 'onSearch — debounced callback',
  render: () => {
    function Demo(): React.ReactElement {
      const [live, setLive] = useState('');
      const [debounced, setDebounced] = useState('');
      return (
        <Stack gap="3" width="360px">
          <SearchInput
            onChange={setLive}
            onSearch={setDebounced}
            debounceMs={400}
            placeholder="Type to search…"
            aria-label="Debounced search"
          />
          <Text size="sm" color="fg.muted">
            Live: <code>{JSON.stringify(live)}</code>
          </Text>
          <Text size="sm" color="fg.muted">
            Debounced (400 ms): <code>{JSON.stringify(debounced)}</code>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const OnSubmitEnter: Story = {
  name: 'onSubmit — fires on Enter',
  render: () => {
    function Demo(): React.ReactElement {
      const [submitted, setSubmitted] = useState<string | null>(null);
      return (
        <Stack gap="3" width="360px">
          <SearchInput
            onSubmit={setSubmitted}
            placeholder="Press Enter to submit"
            aria-label="Submit search"
          />
          <Text size="sm" color="fg.muted">
            Last submit: <code>{submitted === null ? 'null' : JSON.stringify(submitted)}</code>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · type, debounced onSearch, Escape clears',
  render: () => {
    function Demo(): React.ReactElement {
      const [debounced, setDebounced] = useState('');
      return (
        <Stack gap="3" width="360px">
          <SearchInput onSearch={setDebounced} debounceMs={50} aria-label="Search" />
          <Text size="sm" color="fg.muted">
            Debounced: <code data-testid="debounced">{debounced}</code>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox', { name: 'Search' });
    await userEvent.type(input, 'query');
    await expect(input).toHaveValue('query');
    // Debounced onSearch fires after the typing settles.
    await waitFor(() => expect(canvas.getByTestId('debounced')).toHaveTextContent('query'));
    // Escape clears a non-empty field.
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
  },
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('');
      const invalid = value.length > 0 && value.length < 3;
      return (
        <Form>
          <Stack gap="4" width="380px">
            <FormField name="q" invalid={invalid} required>
              <FormLabel>Find a record</FormLabel>
              <FormControl>
                <SearchInput value={value} onChange={setValue} placeholder="At least 3 chars…" />
              </FormControl>
              <FormDescription>Press Escape to clear.</FormDescription>
              <FormMessage>{invalid ? 'Type at least 3 characters.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
