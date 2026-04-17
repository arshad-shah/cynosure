import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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
import { Textarea } from './Textarea.js';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    rows: { control: { type: 'number', min: 1, max: 20, step: 1 } },
    maxRows: { control: { type: 'number', min: 1, max: 40, step: 1 } },
    autoResize: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  args: {
    placeholder: 'Write your story…',
    variant: 'outline',
    size: 'md',
    rows: 4,
  },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea variant="outline" placeholder="Outline" />
      <Textarea variant="filled" placeholder="Filled" />
      <Textarea variant="ghost" placeholder="Ghost" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea size="sm" placeholder="Small" />
      <Textarea size="md" placeholder="Medium" />
      <Textarea size="lg" placeholder="Large" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea placeholder="Default" />
      <Textarea placeholder="Read only" defaultValue="Read-only content" readOnly />
      <Textarea placeholder="Disabled" disabled />
      <Textarea placeholder="Invalid" defaultValue="Too short" invalid />
      <Textarea placeholder="Required" required />
    </Stack>
  ),
};

export const Rows: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea rows={2} placeholder="rows=2" />
      <Textarea rows={4} placeholder="rows=4" />
      <Textarea rows={8} placeholder="rows=8" />
    </Stack>
  ),
};

export const AutoResize: Story = {
  name: 'Auto-resize — grows with content',
  render: () => {
    function AutoResizeDemo(): React.ReactElement {
      const [value, setValue] = useState(
        'Try typing (or pasting) multi-line content — the textarea grows to fit.\n\nAdd more lines…',
      );
      return (
        <Stack gap="3" width="420px">
          <Textarea autoResize value={value} onChange={setValue} />
          <Text size="sm" color="fg.muted">
            Uses native <code>field-sizing: content</code> in supported browsers.
          </Text>
        </Stack>
      );
    }
    return <AutoResizeDemo />;
  },
};

export const AutoResizeWithMaxRows: Story = {
  name: 'Auto-resize capped by maxRows',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState(
        Array.from({ length: 10 }, (_, i) => `Line ${i + 1}`).join('\n'),
      );
      return (
        <Stack gap="3" width="420px">
          <Textarea autoResize maxRows={5} value={value} onChange={setValue} />
          <Text size="sm" color="fg.muted">
            Grows to content, but stops at <code>maxRows=5</code>.
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
      const [value, setValue] = useState('');
      return (
        <Stack gap="3" width="420px">
          <Textarea value={value} onChange={setValue} placeholder="Type here" rows={4} />
          <Text size="sm">
            Character count: <strong>{value.length}</strong>
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
      const [bio, setBio] = useState('');
      const tooLong = bio.length > 140;
      return (
        <Form>
          <Stack gap="4" width="480px">
            <FormField name="bio" invalid={tooLong}>
              <FormLabel>Short bio</FormLabel>
              <FormControl>
                <Textarea value={bio} onChange={setBio} rows={4} placeholder="About you…" />
              </FormControl>
              <FormDescription>Maximum 140 characters.</FormDescription>
              <FormMessage>
                {tooLong ? `Too long by ${bio.length - 140} characters.` : undefined}
              </FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};

export const LongText: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea
        rows={6}
        defaultValue={`${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20)}`}
      />
    </Stack>
  ),
};
