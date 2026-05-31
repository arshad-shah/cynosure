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
import { Input } from './Input.js';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost', 'flat'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'url', 'search', 'number'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

const SearchIcon = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <title>Search</title>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Dollar = (): React.ReactElement => <span aria-hidden>$</span>;

export const Playground: Story = {
  args: { placeholder: 'Type something…', variant: 'outline', size: 'md', type: 'text' },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Input variant="outline" placeholder="Outline" />
      <Input variant="filled" placeholder="Filled" />
      <Input variant="ghost" placeholder="Ghost" />
      <Input variant="flat" placeholder="Flat (legacy single-well)" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Input placeholder="Default" />
      <Input placeholder="Read only" defaultValue="Read only content" readOnly />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Invalid" defaultValue="bad-email" invalid />
      <Input placeholder="Required" required />
    </Stack>
  ),
};

export const Slots: Story = {
  name: 'Slots — inert (icon / prefix) and action (button)',
  render: () => (
    <Stack gap="3" width="360px">
      <Input leadingSlot="https://" placeholder="example.com" />
      <Input trailingSlot=".com" placeholder="example" />
      <Input leadingSlot="https://" trailingSlot=".com" placeholder="example" />
      <Input leadingSlot={<SearchIcon />} placeholder="Search…" />
      <Input leadingSlot={<Dollar />} trailingSlot={<span>USD</span>} placeholder="0.00" />
    </Stack>
  ),
};

export const Clearable: Story = {
  render: () => {
    function Clear(): React.ReactElement {
      const [value, setValue] = useState('Clear me');
      return (
        <Stack gap="3" width="320px">
          <Input clearable value={value} onChange={setValue} placeholder="Clearable" />
          <Input
            clearable
            invalid
            value={value}
            onChange={setValue}
            placeholder="Clearable, invalid"
          />
          <Text size="sm" color="fg.muted">
            Value: <code>{JSON.stringify(value)}</code>
          </Text>
        </Stack>
      );
    }
    return <Clear />;
  },
};

export const Password: Story = {
  name: 'Password — show/hide toggle',
  render: () => <Input type="password" defaultValue="hunter2" placeholder="Password" />,
};

export const Interaction: Story = {
  name: 'Interaction · type updates value',
  render: () => <Input placeholder="Type here" aria-label="Demo input" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Demo input' });
    await expect(input).toHaveValue('');
    await userEvent.type(input, 'hello world');
    await expect(input).toHaveValue('hello world');
  },
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState('');
      return (
        <Stack gap="3" width="320px">
          <Input value={value} onChange={setValue} placeholder="Type here" />
          <Text size="sm">
            Live value: <strong>{value || '(empty)'}</strong>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [email, setEmail] = useState('');
      const invalid = email.length > 0 && !email.includes('@');
      return (
        <Form>
          <Stack gap="4" width="360px">
            <FormField name="email" invalid={invalid} required>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" value={email} onChange={setEmail} />
              </FormControl>
              <FormDescription>We will never share your email.</FormDescription>
              <FormMessage>{invalid ? 'Needs an @' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
